// IndexedDB utility for storing prompt history

export interface StoredPrompt {
  id: string;
  title: string;
  timestamp: number;
  roles: Array<{
    id: number;
    text: string;
    skills: string[];
  }>;
  contexts: Array<{
    id: number;
    text: string;
  }>;
  tasks: Array<{
    id: number;
    text: string;
    subtasks: Array<{
      id: number;
      text: string;
      config?: {
        maxTokens?: number;
        responseType?: string;
        format?: string;
      };
    }>;
    config?: {
      maxTokens?: number;
      responseType?: string;
      format?: string;
    };
  }>;
  guardRails: Array<{
    id: number;
    text: string;
  }>;
}

const DB_NAME = "PromptGeneratorDB";
const DB_VERSION = 1;
const STORE_NAME = "prompts";

class PromptDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async savePrompt(prompt: StoredPrompt): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(prompt);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save prompt"));
    });
  }

  async getAllPrompts(): Promise<StoredPrompt[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const prompts = request.result as StoredPrompt[];
        // Sort by timestamp, most recent first
        prompts.sort((a, b) => b.timestamp - a.timestamp);
        resolve(prompts);
      };
      request.onerror = () => reject(new Error("Failed to fetch prompts"));
    });
  }

  async getPrompt(id: string): Promise<StoredPrompt | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to fetch prompt"));
    });
  }

  async deletePrompt(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete prompt"));
    });
  }

  async deletePrompts(ids: string[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      let hasError = false;

      ids.forEach((id) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          completed++;
          if (completed === ids.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(new Error("Failed to delete prompts"));
        };
      });
    });
  }
}

export const promptDB = new PromptDB();

// Generate a unique ID for prompts
export function generatePromptId(): string {
  return `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
