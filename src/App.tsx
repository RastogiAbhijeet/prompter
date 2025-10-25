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
} from "./templates";

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLibrary, setShowLibrary] = useState<
    "tasks" | "contexts" | "guardrails" | "roles" | null
  >(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [activeRoleCategory, setActiveRoleCategory] =
    useState<string>("Frontend");
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

  const loadTemplate = (template: Template) => {
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
        subtasks: taskTemplate.subtasks
          ? taskTemplate.subtasks.map((subtaskText, index) => ({
              id: index + 1,
              text: subtaskText,
            }))
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
      subtasks: item.subtasks
        ? item.subtasks.map((text, index) => ({ id: index + 1, text }))
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
    let contextIdCounter = nextContextId;
    const newContexts: ContextItem[] = [];

    selectedRoles.forEach((roleId) => {
      const role = ROLE_LIBRARY.find((r) => r.id === roleId);
      if (role) {
        const skillsText = role.skills
          ? ` (Skills: ${role.skills.join(", ")})`
          : "";
        newContexts.push({
          id: contextIdCounter++,
          text: `Role: ${role.text}${skillsText}`,
        });
      }
    });

    setContexts([...contexts, ...newContexts]);
    setNextContextId(contextIdCounter);
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

  return (
    <div className="app-container">
      <div className="header-row">
        <h1>Prompt Generator</h1>
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
                  <span className="task-number">Task {taskIndex + 1}</span>
                  <input
                    type="text"
                    className="task-input"
                    placeholder="Enter task description..."
                    value={task.text}
                    onChange={(e) => updateTaskText(task.id, e.target.value)}
                    ref={(el) => {
                      taskInputRefs.current[task.id] = el;
                    }}
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
              <button
                className="role-button"
                onClick={() => setShowLibrary("roles")}
                title="Add role"
              >
                👤
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

        {/* Section D: Guard-rails Management */}
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
