import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  TEMPLATES,
  type Template,
  CONTEXT_LIBRARY,
  TASK_LIBRARY,
  GUARDRAIL_LIBRARY,
  ROLE_LIBRARY,
  type LibraryItem,
  type TaskConfig,
} from "./templates";
import { promptDB, generatePromptId, type StoredPrompt } from "./db";

interface SubTask {
  id: number;
  text: string;
  config?: TaskConfig;
}

interface Task {
  id: number;
  text: string;
  subtasks: SubTask[];
  config?: TaskConfig;
}

interface ContextItem {
  id: number;
  text: string;
}

interface GuardRail {
  id: number;
  text: string;
}

interface Role {
  id: number;
  text: string;
  skills: string[];
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTaskId, setNextTaskId] = useState(1);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [nextContextId, setNextContextId] = useState(1);
  const [guardRails, setGuardRails] = useState<GuardRail[]>([]);
  const [nextGuardRailId, setNextGuardRailId] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [nextRoleId, setNextRoleId] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formatType, setFormatType] = useState<"text" | "xml">("text");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLibrary, setShowLibrary] = useState<
    "tasks" | "contexts" | "guardrails" | "roles" | null
  >(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [activeRoleCategory, setActiveRoleCategory] =
    useState<string>("Frontend");
  const taskInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // New state for prompt history
  const [promptTitle, setPromptTitle] = useState("");
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [historicalPrompts, setHistoricalPrompts] = useState<StoredPrompt[]>(
    []
  );
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(
    new Set()
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [draggedSubTask, setDraggedSubTask] = useState<{
    taskId: number;
    index: number;
  } | null>(null);
  const [draggedContextIndex, setDraggedContextIndex] = useState<number | null>(
    null
  );
  const [draggedGuardRailIndex, setDraggedGuardRailIndex] = useState<
    number | null
  >(null);
  const [draggedRoleIndex, setDraggedRoleIndex] = useState<number | null>(null);
  const [showTaskConfig, setShowTaskConfig] = useState<number | null>(null);
  const [showSubTaskConfig, setShowSubTaskConfig] = useState<{
    taskId: number;
    subtaskId: number;
  } | null>(null);

  const addTask = () => {
    const newTask: Task = {
      id: nextTaskId,
      text: "",
      subtasks: [],
    };
    setTasks([...tasks, newTask]);
    const newTaskId = nextTaskId;
    setNextTaskId(nextTaskId + 1);

    // Focus on the newly created task input
    setTimeout(() => {
      taskInputRefs.current[newTaskId]?.focus();
    }, 0);
  };

  const updateTaskText = (taskId: number, text: string) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, text } : task))
    );
  };

  const updateTaskConfig = (taskId: number, config: TaskConfig) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, config } : task))
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Task drag and drop handlers
  const handleTaskDragStart = (index: number) => {
    setDraggedTaskIndex(index);
  };

  const handleTaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTaskIndex === null || draggedTaskIndex === index) return;

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedTaskIndex];
    newTasks.splice(draggedTaskIndex, 1);
    newTasks.splice(index, 0, draggedTask);

    setTasks(newTasks);
    setDraggedTaskIndex(index);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskIndex(null);
  };

  const addSubTask = (taskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const nextSubTaskId =
            task.subtasks.length > 0
              ? Math.max(...task.subtasks.map((st) => st.id)) + 1
              : 1;
          return {
            ...task,
            subtasks: [...task.subtasks, { id: nextSubTaskId, text: "" }],
          };
        }
        return task;
      })
    );
  };

  const updateSubTaskText = (
    taskId: number,
    subtaskId: number,
    text: string
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, text } : st
            ),
          };
        }
        return task;
      })
    );
  };

  const updateSubTaskConfig = (
    taskId: number,
    subtaskId: number,
    config: TaskConfig
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, config } : st
            ),
          };
        }
        return task;
      })
    );
  };

  const deleteSubTask = (taskId: number, subtaskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
  };

  // SubTask drag and drop handlers
  const handleSubTaskDragStart = (taskId: number, index: number) => {
    setDraggedSubTask({ taskId, index });
  };

  const handleSubTaskDragOver = (
    e: React.DragEvent,
    taskId: number,
    index: number
  ) => {
    e.preventDefault();
    if (
      !draggedSubTask ||
      draggedSubTask.taskId !== taskId ||
      draggedSubTask.index === index
    )
      return;

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newSubtasks = [...task.subtasks];
          const draggedItem = newSubtasks[draggedSubTask.index];
          newSubtasks.splice(draggedSubTask.index, 1);
          newSubtasks.splice(index, 0, draggedItem);
          return { ...task, subtasks: newSubtasks };
        }
        return task;
      })
    );

    setDraggedSubTask({ taskId, index });
  };

  const handleSubTaskDragEnd = () => {
    setDraggedSubTask(null);
  };

  // Context management functions
  const addContext = () => {
    const newContext: ContextItem = {
      id: nextContextId,
      text: "",
    };
    setContexts([...contexts, newContext]);
    setNextContextId(nextContextId + 1);
  };

  const updateContextText = (contextId: number, text: string) => {
    setContexts(
      contexts.map((context) =>
        context.id === contextId ? { ...context, text } : context
      )
    );
  };

  const deleteContext = (contextId: number) => {
    setContexts(contexts.filter((context) => context.id !== contextId));
  };

  // Context drag and drop handlers
  const handleContextDragStart = (index: number) => {
    setDraggedContextIndex(index);
  };

  const handleContextDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedContextIndex === null || draggedContextIndex === index) return;

    const newContexts = [...contexts];
    const draggedContext = newContexts[draggedContextIndex];
    newContexts.splice(draggedContextIndex, 1);
    newContexts.splice(index, 0, draggedContext);

    setContexts(newContexts);
    setDraggedContextIndex(index);
  };

  const handleContextDragEnd = () => {
    setDraggedContextIndex(null);
  };

  // Guard-rail management functions
  const addGuardRail = () => {
    const newGuardRail: GuardRail = {
      id: nextGuardRailId,
      text: "",
    };
    setGuardRails([...guardRails, newGuardRail]);
    setNextGuardRailId(nextGuardRailId + 1);
  };

  const updateGuardRailText = (guardRailId: number, text: string) => {
    setGuardRails(
      guardRails.map((guardRail) =>
        guardRail.id === guardRailId ? { ...guardRail, text } : guardRail
      )
    );
  };

  const deleteGuardRail = (guardRailId: number) => {
    setGuardRails(
      guardRails.filter((guardRail) => guardRail.id !== guardRailId)
    );
  };

  // Guard-rail drag and drop handlers
  const handleGuardRailDragStart = (index: number) => {
    setDraggedGuardRailIndex(index);
  };

  const handleGuardRailDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedGuardRailIndex === null || draggedGuardRailIndex === index)
      return;

    const newGuardRails = [...guardRails];
    const draggedGuardRail = newGuardRails[draggedGuardRailIndex];
    newGuardRails.splice(draggedGuardRailIndex, 1);
    newGuardRails.splice(index, 0, draggedGuardRail);

    setGuardRails(newGuardRails);
    setDraggedGuardRailIndex(index);
  };

  const handleGuardRailDragEnd = () => {
    setDraggedGuardRailIndex(null);
  };

  // Role management functions
  const addRole = () => {
    const newRole: Role = {
      id: nextRoleId,
      text: "",
      skills: [],
    };
    setRoles([...roles, newRole]);
    setNextRoleId(nextRoleId + 1);
  };

  const updateRoleText = (roleId: number, text: string) => {
    setRoles(
      roles.map((role) => (role.id === roleId ? { ...role, text } : role))
    );
  };

  const updateRoleSkills = (roleId: number, skills: string[]) => {
    setRoles(
      roles.map((role) => (role.id === roleId ? { ...role, skills } : role))
    );
  };

  const deleteRole = (roleId: number) => {
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  // Role drag and drop handlers
  const handleRoleDragStart = (index: number) => {
    setDraggedRoleIndex(index);
  };

  const handleRoleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRoleIndex === null || draggedRoleIndex === index) return;

    const newRoles = [...roles];
    const draggedRole = newRoles[draggedRoleIndex];
    newRoles.splice(draggedRoleIndex, 1);
    newRoles.splice(index, 0, draggedRole);

    setRoles(newRoles);
    setDraggedRoleIndex(index);
  };

  const handleRoleDragEnd = () => {
    setDraggedRoleIndex(null);
  };

  const generatePrompt = () => {
    if (formatType === "xml") {
      return generateXMLPrompt();
    }
    return generateTextPrompt();
  };

  const generateTextPrompt = () => {
    let prompt = "";

    // Add Role section
    if (roles.length > 0 && roles.some((r) => r.text.trim())) {
      prompt += "ROLE:\n";
      roles.forEach((role) => {
        if (role.text.trim()) {
          prompt += `${role.text}\n`;
          if (role.skills && role.skills.length > 0) {
            prompt += `Skills: ${role.skills.join(", ")}\n`;
          }
        }
      });
      prompt += "\n";
    }

    // Add Context section
    if (contexts.length > 0 && contexts.some((c) => c.text.trim())) {
      prompt += "CONTEXT:\n";
      contexts.forEach((context, index) => {
        if (context.text.trim()) {
          prompt += `${index + 1}. ${context.text}\n`;
        }
      });
      prompt += "\n";
    }

    // Add Tasks section
    if (tasks.length > 0 && tasks.some((t) => t.text.trim())) {
      prompt += "TASKS:\n";
      tasks.forEach((task, index) => {
        if (task.text.trim()) {
          prompt += `Task ${index + 1}: ${task.text}\n`;
          if (task.config) {
            const configParts = [];
            if (task.config.maxTokens)
              configParts.push(`Max Tokens: ${task.config.maxTokens}`);
            if (task.config.responseType)
              configParts.push(`Response Type: ${task.config.responseType}`);
            if (task.config.format)
              configParts.push(`Format: ${task.config.format}`);
            if (configParts.length > 0) {
              prompt += `   [Config: ${configParts.join(", ")}]\n`;
            }
          }
          task.subtasks.forEach((subtask) => {
            if (subtask.text.trim()) {
              prompt += `   SubTask: ${subtask.text}\n`;
              if (subtask.config) {
                const configParts = [];
                if (subtask.config.maxTokens)
                  configParts.push(`Max Tokens: ${subtask.config.maxTokens}`);
                if (subtask.config.responseType)
                  configParts.push(
                    `Response Type: ${subtask.config.responseType}`
                  );
                if (subtask.config.format)
                  configParts.push(`Format: ${subtask.config.format}`);
                if (configParts.length > 0) {
                  prompt += `      [Config: ${configParts.join(", ")}]\n`;
                }
              }
            }
          });
        }
      });
      prompt += "\n";
    }

    // Add Guard-rails section
    if (guardRails.length > 0 && guardRails.some((g) => g.text.trim())) {
      prompt += "GUARD-RAILS:\n";
      guardRails.forEach((guardRail, index) => {
        if (guardRail.text.trim()) {
          prompt += `${index + 1}. ${guardRail.text}\n`;
        }
      });
    }

    return prompt.trim();
  };

  const generateXMLPrompt = () => {
    let prompt = "";

    // Add Role section
    if (roles.length > 0 && roles.some((r) => r.text.trim())) {
      prompt += "<role>\n";
      roles.forEach((role) => {
        if (role.text.trim()) {
          prompt += `  <title>${role.text}</title>\n`;
          if (role.skills && role.skills.length > 0) {
            prompt += `  <skills>${role.skills.join(", ")}</skills>\n`;
          }
        }
      });
      prompt += "</role>\n\n";
    }

    // Add Context section
    if (contexts.length > 0 && contexts.some((c) => c.text.trim())) {
      prompt += "<context>\n";
      contexts.forEach((context) => {
        if (context.text.trim()) {
          prompt += `  <item>${context.text}</item>\n`;
        }
      });
      prompt += "</context>\n\n";
    }

    // Add Tasks section
    if (tasks.length > 0 && tasks.some((t) => t.text.trim())) {
      prompt += "<tasks>\n";
      tasks.forEach((task) => {
        if (task.text.trim()) {
          prompt += `  <task>\n`;
          prompt += `    <description>${task.text}</description>\n`;
          if (task.config) {
            prompt += `    <config>\n`;
            if (task.config.maxTokens)
              prompt += `      <maxTokens>${task.config.maxTokens}</maxTokens>\n`;
            if (task.config.responseType)
              prompt += `      <responseType>${task.config.responseType}</responseType>\n`;
            if (task.config.format)
              prompt += `      <format>${task.config.format}</format>\n`;
            prompt += `    </config>\n`;
          }
          if (
            task.subtasks.length > 0 &&
            task.subtasks.some((st) => st.text.trim())
          ) {
            prompt += `    <subtasks>\n`;
            task.subtasks.forEach((subtask) => {
              if (subtask.text.trim()) {
                prompt += `      <subtask>\n`;
                prompt += `        <description>${subtask.text}</description>\n`;
                if (subtask.config) {
                  prompt += `        <config>\n`;
                  if (subtask.config.maxTokens)
                    prompt += `          <maxTokens>${subtask.config.maxTokens}</maxTokens>\n`;
                  if (subtask.config.responseType)
                    prompt += `          <responseType>${subtask.config.responseType}</responseType>\n`;
                  if (subtask.config.format)
                    prompt += `          <format>${subtask.config.format}</format>\n`;
                  prompt += `        </config>\n`;
                }
                prompt += `      </subtask>\n`;
              }
            });
            prompt += `    </subtasks>\n`;
          }
          prompt += `  </task>\n`;
        }
      });
      prompt += "</tasks>\n\n";
    }

    // Add Guard-rails section
    if (guardRails.length > 0 && guardRails.some((g) => g.text.trim())) {
      prompt += "<guardrails>\n";
      guardRails.forEach((guardRail) => {
        if (guardRail.text.trim()) {
          prompt += `  <rule>${guardRail.text}</rule>\n`;
        }
      });
      prompt += "</guardrails>";
    }

    return prompt.trim();
  };

  const copyToClipboard = async () => {
    const prompt = generatePrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadTemplate = (template: Template) => {
    // Load roles
    const newRoles: Role[] = template.roles.map((roleTemplate, index) => ({
      id: nextRoleId + index,
      text: roleTemplate.text,
      skills: roleTemplate.skills,
    }));
    setRoles(newRoles);
    setNextRoleId(nextRoleId + template.roles.length);

    // Load contexts
    const newContexts: ContextItem[] = template.contexts.map((text, index) => ({
      id: nextContextId + index,
      text,
    }));
    setContexts(newContexts);
    setNextContextId(nextContextId + template.contexts.length);

    // Load tasks and subtasks
    let taskIdCounter = nextTaskId;
    const newTasks: Task[] = template.tasks.map((taskTemplate) => {
      const task: Task = {
        id: taskIdCounter++,
        text: taskTemplate.text,
        config: taskTemplate.config,
        subtasks: taskTemplate.subtasks
          ? taskTemplate.subtasks.map((subtaskItem, index) => {
              if (typeof subtaskItem === "string") {
                return {
                  id: index + 1,
                  text: subtaskItem,
                };
              } else {
                return {
                  id: index + 1,
                  text: subtaskItem.text,
                  config: subtaskItem.config,
                };
              }
            })
          : [],
      };
      return task;
    });
    setTasks(newTasks);
    setNextTaskId(taskIdCounter);

    // Load guard-rails
    const newGuardRails: GuardRail[] = template.guardRails.map(
      (text, index) => ({
        id: nextGuardRailId + index,
        text,
      })
    );
    setGuardRails(newGuardRails);
    setNextGuardRailId(nextGuardRailId + template.guardRails.length);

    // Close dropdown
    setShowTemplates(false);
  };

  // Add items from library
  const addTaskFromLibrary = (item: LibraryItem) => {
    const newTask: Task = {
      id: nextTaskId,
      text: item.text,
      config: item.config,
      subtasks: item.subtasks
        ? item.subtasks.map((subtaskItem, index) => {
            if (typeof subtaskItem === "string") {
              return { id: index + 1, text: subtaskItem };
            } else {
              return {
                id: index + 1,
                text: subtaskItem.text,
                config: subtaskItem.config,
              };
            }
          })
        : [],
    };
    setTasks([...tasks, newTask]);
    setNextTaskId(nextTaskId + 1);
    setShowLibrary(null);
  };

  const addContextFromLibrary = (item: LibraryItem) => {
    const newContext: ContextItem = {
      id: nextContextId,
      text: item.text,
    };
    setContexts([...contexts, newContext]);
    setNextContextId(nextContextId + 1);
    setShowLibrary(null);
  };

  const toggleRoleSelection = (roleId: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const addSelectedRoles = () => {
    let roleIdCounter = nextRoleId;
    const newRoles: Role[] = [];

    selectedRoles.forEach((roleId) => {
      const role = ROLE_LIBRARY.find((r) => r.id === roleId);
      if (role) {
        newRoles.push({
          id: roleIdCounter++,
          text: role.text,
          skills: role.skills || [],
        });
      }
    });

    setRoles([...roles, ...newRoles]);
    setNextRoleId(roleIdCounter);
    setSelectedRoles(new Set());
    setShowLibrary(null);
  };

  const addGuardRailFromLibrary = (item: LibraryItem) => {
    const newGuardRail: GuardRail = {
      id: nextGuardRailId,
      text: item.text,
    };
    setGuardRails([...guardRails, newGuardRail]);
    setNextGuardRailId(nextGuardRailId + 1);
    setShowLibrary(null);
  };

  // Save current prompt to IndexedDB
  const savePrompt = async () => {
    try {
      const promptId = currentPromptId || generatePromptId();
      const prompt: StoredPrompt = {
        id: promptId,
        title:
          promptTitle || `Untitled Prompt ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        roles,
        contexts,
        tasks,
        guardRails,
      };

      await promptDB.savePrompt(prompt);
      setCurrentPromptId(promptId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Refresh historical prompts list
      loadHistoricalPrompts();
    } catch (err) {
      console.error("Failed to save prompt:", err);
      alert("Failed to save prompt. Please try again.");
    }
  };

  // Load historical prompts from IndexedDB
  const loadHistoricalPrompts = async () => {
    try {
      const prompts = await promptDB.getAllPrompts();
      setHistoricalPrompts(prompts);
    } catch (err) {
      console.error("Failed to load prompts:", err);
    }
  };

  // Load a specific prompt
  const loadPrompt = (prompt: StoredPrompt) => {
    setPromptTitle(prompt.title);
    setCurrentPromptId(prompt.id);
    setRoles(prompt.roles);
    setContexts(prompt.contexts);
    setTasks(prompt.tasks);
    setGuardRails(prompt.guardRails);

    // Update next IDs to prevent conflicts
    setNextRoleId(Math.max(...prompt.roles.map((r) => r.id), 0) + 1);
    setNextContextId(Math.max(...prompt.contexts.map((c) => c.id), 0) + 1);
    setNextTaskId(Math.max(...prompt.tasks.map((t) => t.id), 0) + 1);
    setNextGuardRailId(Math.max(...prompt.guardRails.map((g) => g.id), 0) + 1);
  };

  // Delete selected prompts
  const deleteSelectedPrompts = async () => {
    if (selectedPromptIds.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedPromptIds.size} prompt(s)?`
      )
    ) {
      return;
    }

    try {
      await promptDB.deletePrompts(Array.from(selectedPromptIds));
      setSelectedPromptIds(new Set());
      loadHistoricalPrompts();
    } catch (err) {
      console.error("Failed to delete prompts:", err);
      alert("Failed to delete prompts. Please try again.");
    }
  };

  // Toggle prompt selection
  const togglePromptSelection = (id: string) => {
    const newSelected = new Set(selectedPromptIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPromptIds(newSelected);
  };

  // Clear current prompt to start fresh
  const clearPrompt = () => {
    if (
      tasks.length > 0 ||
      contexts.length > 0 ||
      guardRails.length > 0 ||
      roles.length > 0
    ) {
      if (!confirm("Are you sure you want to clear the current prompt?")) {
        return;
      }
    }

    setPromptTitle("");
    setCurrentPromptId(null);
    setTasks([]);
    setContexts([]);
    setGuardRails([]);
    setRoles([]);
    setNextTaskId(1);
    setNextContextId(1);
    setNextGuardRailId(1);
    setNextRoleId(1);
  };

  // Start a new prompt
  const newPrompt = () => {
    if (
      tasks.length > 0 ||
      contexts.length > 0 ||
      guardRails.length > 0 ||
      roles.length > 0 ||
      promptTitle.trim()
    ) {
      if (
        !confirm(
          "Start a new prompt? Current changes will be lost if not saved."
        )
      ) {
        return;
      }
    }

    setPromptTitle("");
    setCurrentPromptId(null);
    setTasks([]);
    setContexts([]);
    setGuardRails([]);
    setRoles([]);
    setNextTaskId(1);
    setNextContextId(1);
    setNextGuardRailId(1);
    setNextRoleId(1);
    setSelectedPromptIds(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) to add task
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        // Check if there are no tasks, or if the last task has content
        const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
        if (!lastTask || lastTask.text.trim() !== "") {
          addTask();
        }
      }
      // Cmd+\ to add context
      else if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        addContext();
      }
      // Cmd+] to add guard-rail
      else if ((e.metaKey || e.ctrlKey) && e.key === "]") {
        e.preventDefault();
        addGuardRail();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tasks]);

  // Close templates dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showTemplates && !target.closest(".templates-dropdown-container")) {
        setShowTemplates(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplates]);

  // Load historical prompts on mount
  useEffect(() => {
    loadHistoricalPrompts();
  }, []);

  return (
    <div className="app-container">
      <div className="header-row">
        <h1>Prompt Generator</h1>
        <div className="header-controls">
          <div className="templates-dropdown-container">
            <button
              className="templates-button"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              📋 Load Template
            </button>
            {showTemplates && (
              <div className="templates-dropdown">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className="template-item"
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="template-name">{template.name}</div>
                    <div className="template-category">{template.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="main-layout">
        {/* History Sidebar */}
        <div className="sidebar-history">
          <div className="section history-section">
            <div className="section-header">
              <h2>📚 History ({historicalPrompts.length})</h2>
              <button
                className="new-prompt-button"
                onClick={newPrompt}
                title="Start a new prompt"
              >
                ✨ New
              </button>
            </div>
            {selectedPromptIds.size > 0 && (
              <div className="history-actions">
                <button
                  className="delete-selected-button-inline"
                  onClick={deleteSelectedPrompts}
                  title="Delete selected prompts"
                >
                  🗑️ Delete ({selectedPromptIds.size})
                </button>
              </div>
            )}
            <div className="history-list">
              {historicalPrompts.length === 0 ? (
                <div className="empty-history-inline">
                  <p>No saved prompts yet.</p>
                  <p>Save your first prompt!</p>
                </div>
              ) : (
                historicalPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`history-item-inline ${
                      selectedPromptIds.has(prompt.id) ? "selected" : ""
                    } ${currentPromptId === prompt.id ? "active" : ""}`}
                  >
                    <div className="history-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedPromptIds.has(prompt.id)}
                        onChange={() => togglePromptSelection(prompt.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${prompt.title}`}
                      />
                    </div>
                    <div
                      className="history-content-inline"
                      onClick={() => loadPrompt(prompt)}
                    >
                      <div className="history-title-inline">{prompt.title}</div>
                      <div className="history-date-inline">
                        {new Date(prompt.timestamp).toLocaleDateString()}
                      </div>
                      <div className="history-stats-inline">
                        {prompt.roles.length > 0 && (
                          <span>👤 {prompt.roles.length}</span>
                        )}
                        {prompt.contexts.length > 0 && (
                          <span>📝 {prompt.contexts.length}</span>
                        )}
                        {prompt.tasks.length > 0 && (
                          <span>✅ {prompt.tasks.length}</span>
                        )}
                        {prompt.guardRails.length > 0 && (
                          <span>🛡️ {prompt.guardRails.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Prompt Title and Actions */}
          <div className="prompt-title-section">
            <input
              type="text"
              className="prompt-title-input"
              placeholder="Enter prompt title..."
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
            />
            <div className="prompt-actions">
              <button
                className="save-button"
                onClick={savePrompt}
                disabled={
                  tasks.length === 0 &&
                  contexts.length === 0 &&
                  guardRails.length === 0 &&
                  roles.length === 0
                }
              >
                {saveSuccess
                  ? "✓ Saved!"
                  : currentPromptId
                  ? "💾 Update"
                  : "💾 Save"}
              </button>
              <button className="clear-button" onClick={clearPrompt}>
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Display */}
          <div className="shortcuts-text">
            ⌘+Enter: Task | ⌘+\: Context | ⌘+]: Guardrails | Role library: 👤
          </div>

          {/* Two Column Layout: Prompt | Controllers */}
          <div className="content-columns">
            {/* Left: Final Prompt Display */}
            <div className="column-prompt">
              <div className="section prompt-section">
                <div className="section-header">
                  <h2>Final Prompt</h2>
                  <div className="header-controls">
                    <div className="format-toggle">
                      <button
                        className={`toggle-btn ${
                          formatType === "text" ? "active" : ""
                        }`}
                        onClick={() => setFormatType("text")}
                      >
                        Text
                      </button>
                      <button
                        className={`toggle-btn ${
                          formatType === "xml" ? "active" : ""
                        }`}
                        onClick={() => setFormatType("xml")}
                      >
                        XML
                      </button>
                    </div>
                    <button
                      className="copy-button"
                      onClick={copyToClipboard}
                      disabled={
                        tasks.length === 0 &&
                        contexts.length === 0 &&
                        guardRails.length === 0 &&
                        roles.length === 0
                      }
                    >
                      {copySuccess ? "✓ Copied!" : "Copy Prompt"}
                    </button>
                  </div>
                </div>
                <pre className="prompt-display">
                  {generatePrompt() ||
                    "Add a role, context, tasks, or guard-rails to generate a prompt..."}
                </pre>
              </div>
            </div>

            {/* Right: All Input Sections */}
            <div className="column-controls">
              {/* Section B: Task and SubTask Management */}
              <div className="section tasks-section">
                <div className="section-header">
                  <h2>Tasks & SubTasks</h2>
                  <div className="button-group">
                    <button className="add-button" onClick={addTask}>
                      + Add Task
                    </button>
                    <button
                      className="library-button"
                      onClick={() => setShowLibrary("tasks")}
                      title="Pick from library"
                    >
                      📚
                    </button>
                  </div>
                </div>

                <div className="tasks-list">
                  {tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={`task-item ${
                        draggedTaskIndex === taskIndex ? "dragging" : ""
                      }`}
                      onDragOver={(e) => handleTaskDragOver(e, taskIndex)}
                    >
                      <div className="task-header">
                        <span
                          className="drag-handle"
                          title="Drag to reorder"
                          draggable
                          onDragStart={() => handleTaskDragStart(taskIndex)}
                          onDragEnd={handleTaskDragEnd}
                        >
                          ⋮⋮
                        </span>
                        <span className="task-number">
                          Task {taskIndex + 1}
                        </span>
                        <input
                          type="text"
                          className="task-input"
                          placeholder="Enter task description..."
                          value={task.text}
                          onChange={(e) =>
                            updateTaskText(task.id, e.target.value)
                          }
                          ref={(el) => {
                            taskInputRefs.current[task.id] = el;
                          }}
                        />
                        <button
                          className={`config-button ${
                            task.config ? "has-config" : ""
                          }`}
                          onClick={() =>
                            setShowTaskConfig(
                              showTaskConfig === task.id ? null : task.id
                            )
                          }
                          title="Configure output behavior"
                        >
                          ⚙️
                        </button>
                        <button
                          className="add-subtask-button"
                          onClick={() => addSubTask(task.id)}
                          title="Add SubTask"
                        >
                          +
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                        >
                          ×
                        </button>
                      </div>

                      {showTaskConfig === task.id && (
                        <div className="config-panel">
                          <div className="config-row">
                            <label>Max Tokens:</label>
                            <input
                              type="number"
                              className="config-input"
                              placeholder="e.g., 500"
                              value={task.config?.maxTokens || ""}
                              onChange={(e) =>
                                updateTaskConfig(task.id, {
                                  ...task.config,
                                  maxTokens: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </div>
                          <div className="config-row">
                            <label>Response Type:</label>
                            <select
                              className="config-select"
                              value={task.config?.responseType || ""}
                              onChange={(e) =>
                                updateTaskConfig(task.id, {
                                  ...task.config,
                                  responseType: e.target.value || undefined,
                                })
                              }
                              aria-label="Response Type"
                            >
                              <option value="">Select...</option>
                              <option value="code">Code</option>
                              <option value="explanation">Explanation</option>
                              <option value="step-by-step">Step-by-step</option>
                              <option value="detailed">Detailed</option>
                              <option value="concise">Concise</option>
                              <option value="bullet-points">
                                Bullet Points
                              </option>
                            </select>
                          </div>
                          <div className="config-row">
                            <label>Format:</label>
                            <select
                              className="config-select"
                              value={task.config?.format || ""}
                              onChange={(e) =>
                                updateTaskConfig(task.id, {
                                  ...task.config,
                                  format: e.target.value || undefined,
                                })
                              }
                              aria-label="Output Format"
                            >
                              <option value="">Select...</option>
                              <option value="markdown">Markdown</option>
                              <option value="plain">Plain Text</option>
                              <option value="json">JSON</option>
                              <option value="xml">XML</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {task.subtasks.length > 0 && (
                        <div className="subtasks-list">
                          {task.subtasks.map((subtask, subtaskIndex) => (
                            <div
                              key={subtask.id}
                              className={`subtask-item ${
                                draggedSubTask?.taskId === task.id &&
                                draggedSubTask?.index === subtaskIndex
                                  ? "dragging"
                                  : ""
                              }`}
                              onDragOver={(e) =>
                                handleSubTaskDragOver(e, task.id, subtaskIndex)
                              }
                            >
                              <div className="subtask-header">
                                <span
                                  className="drag-handle small"
                                  title="Drag to reorder"
                                  draggable
                                  onDragStart={() =>
                                    handleSubTaskDragStart(
                                      task.id,
                                      subtaskIndex
                                    )
                                  }
                                  onDragEnd={handleSubTaskDragEnd}
                                >
                                  ⋮⋮
                                </span>
                                <span className="subtask-label">SubTask:</span>
                                <input
                                  type="text"
                                  className="subtask-input"
                                  placeholder="Enter subtask description..."
                                  value={subtask.text}
                                  onChange={(e) =>
                                    updateSubTaskText(
                                      task.id,
                                      subtask.id,
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  className={`config-button small ${
                                    subtask.config ? "has-config" : ""
                                  }`}
                                  onClick={() =>
                                    setShowSubTaskConfig(
                                      showSubTaskConfig?.taskId === task.id &&
                                        showSubTaskConfig?.subtaskId ===
                                          subtask.id
                                        ? null
                                        : {
                                            taskId: task.id,
                                            subtaskId: subtask.id,
                                          }
                                    )
                                  }
                                  title="Configure output behavior"
                                >
                                  ⚙️
                                </button>
                                <button
                                  className="delete-button small"
                                  onClick={() =>
                                    deleteSubTask(task.id, subtask.id)
                                  }
                                  title="Delete SubTask"
                                >
                                  ×
                                </button>
                              </div>

                              {showSubTaskConfig?.taskId === task.id &&
                                showSubTaskConfig?.subtaskId === subtask.id && (
                                  <div className="config-panel subtask-config">
                                    <div className="config-row">
                                      <label>Max Tokens:</label>
                                      <input
                                        type="number"
                                        className="config-input"
                                        placeholder="e.g., 500"
                                        value={subtask.config?.maxTokens || ""}
                                        onChange={(e) =>
                                          updateSubTaskConfig(
                                            task.id,
                                            subtask.id,
                                            {
                                              ...subtask.config,
                                              maxTokens: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                            }
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="config-row">
                                      <label>Response Type:</label>
                                      <select
                                        className="config-select"
                                        value={
                                          subtask.config?.responseType || ""
                                        }
                                        onChange={(e) =>
                                          updateSubTaskConfig(
                                            task.id,
                                            subtask.id,
                                            {
                                              ...subtask.config,
                                              responseType:
                                                e.target.value || undefined,
                                            }
                                          )
                                        }
                                        aria-label="Response Type"
                                      >
                                        <option value="">Select...</option>
                                        <option value="code">Code</option>
                                        <option value="explanation">
                                          Explanation
                                        </option>
                                        <option value="step-by-step">
                                          Step-by-step
                                        </option>
                                        <option value="detailed">
                                          Detailed
                                        </option>
                                        <option value="concise">Concise</option>
                                        <option value="bullet-points">
                                          Bullet Points
                                        </option>
                                      </select>
                                    </div>
                                    <div className="config-row">
                                      <label>Format:</label>
                                      <select
                                        className="config-select"
                                        value={subtask.config?.format || ""}
                                        onChange={(e) =>
                                          updateSubTaskConfig(
                                            task.id,
                                            subtask.id,
                                            {
                                              ...subtask.config,
                                              format:
                                                e.target.value || undefined,
                                            }
                                          )
                                        }
                                        aria-label="Output Format"
                                      >
                                        <option value="">Select...</option>
                                        <option value="markdown">
                                          Markdown
                                        </option>
                                        <option value="plain">
                                          Plain Text
                                        </option>
                                        <option value="json">JSON</option>
                                        <option value="xml">XML</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <div className="empty-state">
                      Click "+ Add Task" to get started
                    </div>
                  )}
                </div>
              </div>

              {/* Section C: Role Management */}
              <div className="section role-section">
                <div className="section-header">
                  <h2>Role</h2>
                  <div className="button-group">
                    <button className="add-button" onClick={addRole}>
                      + Add Role
                    </button>
                    <button
                      className="library-button"
                      onClick={() => setShowLibrary("roles")}
                      title="Pick from library"
                    >
                      👤
                    </button>
                  </div>
                </div>

                <div className="roles-list">
                  {roles.map((role, roleIndex) => (
                    <div
                      key={role.id}
                      className={`role-item-container ${
                        draggedRoleIndex === roleIndex ? "dragging" : ""
                      }`}
                      onDragOver={(e) => handleRoleDragOver(e, roleIndex)}
                    >
                      <div className="role-header">
                        <span
                          className="drag-handle"
                          title="Drag to reorder"
                          draggable
                          onDragStart={() => handleRoleDragStart(roleIndex)}
                          onDragEnd={handleRoleDragEnd}
                        >
                          ⋮⋮
                        </span>
                        <input
                          type="text"
                          className="role-input"
                          placeholder="Enter role title..."
                          value={role.text}
                          onChange={(e) =>
                            updateRoleText(role.id, e.target.value)
                          }
                        />
                        <button
                          className="delete-button"
                          onClick={() => deleteRole(role.id)}
                          title="Delete Role"
                        >
                          ×
                        </button>
                      </div>
                      <div className="role-skills">
                        <input
                          type="text"
                          className="skills-input"
                          placeholder="Skills (comma-separated)..."
                          value={role.skills.join(", ")}
                          onChange={(e) =>
                            updateRoleSkills(
                              role.id,
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s)
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {roles.length === 0 && (
                    <div className="empty-state">
                      Click "+ Add Role" or 👤 to pick from library
                    </div>
                  )}
                </div>
              </div>

              {/* Section D: Context Management */}
              <div className="section context-section">
                <div className="section-header">
                  <h2>Context</h2>
                  <div className="button-group">
                    <button className="add-button" onClick={addContext}>
                      + Add Context
                    </button>
                    <button
                      className="library-button"
                      onClick={() => setShowLibrary("contexts")}
                      title="Pick from library"
                    >
                      📚
                    </button>
                  </div>
                </div>

                <div className="items-list">
                  {contexts.map((context, contextIndex) => (
                    <div
                      key={context.id}
                      className={`item ${
                        draggedContextIndex === contextIndex ? "dragging" : ""
                      }`}
                      onDragOver={(e) => handleContextDragOver(e, contextIndex)}
                    >
                      <span
                        className="drag-handle"
                        title="Drag to reorder"
                        draggable
                        onDragStart={() => handleContextDragStart(contextIndex)}
                        onDragEnd={handleContextDragEnd}
                      >
                        ⋮⋮
                      </span>
                      <span className="item-number">{contextIndex + 1}.</span>
                      <input
                        type="text"
                        className="item-input"
                        placeholder="Enter context information..."
                        value={context.text}
                        onChange={(e) =>
                          updateContextText(context.id, e.target.value)
                        }
                      />
                      <button
                        className="delete-button"
                        onClick={() => deleteContext(context.id)}
                        title="Delete Context"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {contexts.length === 0 && (
                    <div className="empty-state">
                      Click "+ Add Context" to get started
                    </div>
                  )}
                </div>
              </div>

              {/* Section E: Guard-rails Management */}
              <div className="section guardrails-section">
                <div className="section-header">
                  <h2>Guard-rails</h2>
                  <div className="button-group">
                    <button className="add-button" onClick={addGuardRail}>
                      + Add Guard-rail
                    </button>
                    <button
                      className="library-button"
                      onClick={() => setShowLibrary("guardrails")}
                      title="Pick from library"
                    >
                      📚
                    </button>
                  </div>
                </div>

                <div className="items-list">
                  {guardRails.map((guardRail, guardRailIndex) => (
                    <div
                      key={guardRail.id}
                      className={`item ${
                        draggedGuardRailIndex === guardRailIndex
                          ? "dragging"
                          : ""
                      }`}
                      onDragOver={(e) =>
                        handleGuardRailDragOver(e, guardRailIndex)
                      }
                    >
                      <span
                        className="drag-handle"
                        title="Drag to reorder"
                        draggable
                        onDragStart={() =>
                          handleGuardRailDragStart(guardRailIndex)
                        }
                        onDragEnd={handleGuardRailDragEnd}
                      >
                        ⋮⋮
                      </span>
                      <span className="item-number">{guardRailIndex + 1}.</span>
                      <input
                        type="text"
                        className="item-input"
                        placeholder="Enter guard-rail..."
                        value={guardRail.text}
                        onChange={(e) =>
                          updateGuardRailText(guardRail.id, e.target.value)
                        }
                      />
                      <button
                        className="delete-button"
                        onClick={() => deleteGuardRail(guardRail.id)}
                        title="Delete Guard-rail"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {guardRails.length === 0 && (
                    <div className="empty-state">
                      Click "+ Add Guard-rail" to get started
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Library Modal */}
      {showLibrary && (
        <div
          className="library-modal-overlay"
          onClick={() => setShowLibrary(null)}
        >
          <div className="library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="library-modal-header">
              <h3>
                {showLibrary === "tasks" && "📚 Task Library"}
                {showLibrary === "contexts" && "📚 Context Library"}
                {showLibrary === "guardrails" && "📚 Guard-rail Library"}
                {showLibrary === "roles" && "👤 Role Library"}
              </h3>
              <button
                className="close-button"
                onClick={() => setShowLibrary(null)}
              >
                ×
              </button>
            </div>
            <div className="library-items">
              {showLibrary === "tasks" &&
                TASK_LIBRARY.map((item) => (
                  <div
                    key={item.id}
                    className="library-item"
                    onClick={() => addTaskFromLibrary(item)}
                  >
                    <div className="library-item-text">{item.text}</div>
                    <div className="library-item-category">{item.category}</div>
                    {item.subtasks && (
                      <div className="library-item-subtasks">
                        {item.subtasks.length} subtasks
                      </div>
                    )}
                  </div>
                ))}
              {showLibrary === "contexts" &&
                CONTEXT_LIBRARY.map((item) => (
                  <div
                    key={item.id}
                    className="library-item"
                    onClick={() => addContextFromLibrary(item)}
                  >
                    <div className="library-item-text">{item.text}</div>
                    <div className="library-item-category">{item.category}</div>
                  </div>
                ))}
              {showLibrary === "guardrails" &&
                GUARDRAIL_LIBRARY.map((item) => (
                  <div
                    key={item.id}
                    className="library-item"
                    onClick={() => addGuardRailFromLibrary(item)}
                  >
                    <div className="library-item-text">{item.text}</div>
                    <div className="library-item-category">{item.category}</div>
                  </div>
                ))}
              {showLibrary === "roles" && (
                <>
                  <div className="role-categories">
                    {[
                      "Frontend",
                      "Backend",
                      "FullStack",
                      "DevOps",
                      "Blockchain",
                      "AI",
                      "Mobile",
                    ].map((cat) => (
                      <button
                        key={cat}
                        className={`category-tab ${
                          activeRoleCategory === cat ? "active" : ""
                        }`}
                        onClick={() => setActiveRoleCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="role-items">
                    {ROLE_LIBRARY.filter(
                      (r) => r.category === activeRoleCategory
                    ).map((item) => (
                      <div
                        key={item.id}
                        className={`role-item ${
                          selectedRoles.has(item.id) ? "selected" : ""
                        }`}
                        onClick={() => toggleRoleSelection(item.id)}
                      >
                        <div className="role-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedRoles.has(item.id)}
                            onChange={() => {}}
                            aria-label={`Select ${item.text}`}
                          />
                        </div>
                        <div className="role-content">
                          <div className="role-item-text">{item.text}</div>
                          {item.skills && (
                            <div className="role-skills">
                              {item.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.size > 0 && (
                    <div className="role-actions">
                      <button
                        className="add-selected-button"
                        onClick={addSelectedRoles}
                      >
                        Add {selectedRoles.size} Selected Role
                        {selectedRoles.size > 1 ? "s" : ""}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
