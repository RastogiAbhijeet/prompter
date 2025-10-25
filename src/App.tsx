import { useState, useEffect, useRef } from "react";
import "./App.css";

interface SubTask {
  id: number;
  text: string;
}

interface Task {
  id: number;
  text: string;
  subtasks: SubTask[];
}

interface ContextItem {
  id: number;
  text: string;
}

interface GuardRail {
  id: number;
  text: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTaskId, setNextTaskId] = useState(1);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [nextContextId, setNextContextId] = useState(1);
  const [guardRails, setGuardRails] = useState<GuardRail[]>([]);
  const [nextGuardRailId, setNextGuardRailId] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formatType, setFormatType] = useState<"text" | "xml">("text");
  const taskInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

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

  const generatePrompt = () => {
    if (formatType === "xml") {
      return generateXMLPrompt();
    }
    return generateTextPrompt();
  };

  const generateTextPrompt = () => {
    let prompt = "";

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
          task.subtasks.forEach((subtask) => {
            if (subtask.text.trim()) {
              prompt += `   SubTask: ${subtask.text}\n`;
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
          if (
            task.subtasks.length > 0 &&
            task.subtasks.some((st) => st.text.trim())
          ) {
            prompt += `    <subtasks>\n`;
            task.subtasks.forEach((subtask) => {
              if (subtask.text.trim()) {
                prompt += `      <subtask>${subtask.text}</subtask>\n`;
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

  return (
    <div className="app-container">
      <h1>Prompt Generator</h1>

      {/* Keyboard Shortcuts Display */}
      <div className="shortcuts-text">
        ⌘+Enter: Task | ⌘+\: Context | ⌘+]: Guardrails
      </div>

      <div className="sections-container">
        {/* Section A: Final Prompt Display */}
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
                  guardRails.length === 0
                }
              >
                {copySuccess ? "✓ Copied!" : "Copy Prompt"}
              </button>
            </div>
          </div>
          <pre className="prompt-display">
            {generatePrompt() ||
              "Add some context, tasks, or guard-rails to generate a prompt..."}
          </pre>
        </div>

        {/* Section B: Task and SubTask Management */}
        <div className="section tasks-section">
          <div className="section-header">
            <h2>Tasks & SubTasks</h2>
            <button className="add-button" onClick={addTask}>
              + Add Task
            </button>
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
                  <span className="task-number">Task {taskIndex + 1}</span>
                  <input
                    type="text"
                    className="task-input"
                    placeholder="Enter task description..."
                    value={task.text}
                    onChange={(e) => updateTaskText(task.id, e.target.value)}
                    ref={(el) => (taskInputRefs.current[task.id] = el)}
                  />
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
                        <span
                          className="drag-handle small"
                          title="Drag to reorder"
                          draggable
                          onDragStart={() =>
                            handleSubTaskDragStart(task.id, subtaskIndex)
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
                          className="delete-button small"
                          onClick={() => deleteSubTask(task.id, subtask.id)}
                          title="Delete SubTask"
                        >
                          ×
                        </button>
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

        {/* Section C: Context Management */}
        <div className="section context-section">
          <div className="section-header">
            <h2>Context</h2>
            <button className="add-button" onClick={addContext}>
              + Add Context
            </button>
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

        {/* Section D: Guard-rails Management */}
        <div className="section guardrails-section">
          <div className="section-header">
            <h2>Guard-rails</h2>
            <button className="add-button" onClick={addGuardRail}>
              + Add Guard-rail
            </button>
          </div>

          <div className="items-list">
            {guardRails.map((guardRail, guardRailIndex) => (
              <div
                key={guardRail.id}
                className={`item ${
                  draggedGuardRailIndex === guardRailIndex ? "dragging" : ""
                }`}
                onDragOver={(e) => handleGuardRailDragOver(e, guardRailIndex)}
              >
                <span
                  className="drag-handle"
                  title="Drag to reorder"
                  draggable
                  onDragStart={() => handleGuardRailDragStart(guardRailIndex)}
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
  );
}

export default App;
