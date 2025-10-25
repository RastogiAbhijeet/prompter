# Prompt Generator

A web application that helps you create structured prompts for AI assistants. Build prompts with roles, context, tasks, subtasks, and guardrails in both text and XML formats.

## Features

- **Role Management**: Define who the AI should act as (Frontend Developer, Technical Writer, etc.)
- **Context Items**: Add background information for better AI responses
- **Tasks & Subtasks**: Break down requests into organized steps
- **Task Configuration**: Control output with max tokens, response type, and format settings
- **Guardrails**: Set rules and constraints for AI behavior
- **Multiple Formats**: Generate prompts in plain text or XML
- **Template Library**: Quick-start with pre-built templates for common scenarios
- **Item Libraries**: Choose from curated roles, tasks, contexts, and guardrails
- **Prompt History**: Save and reload prompts using IndexedDB
- **Drag & Drop**: Reorder items easily

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use

### Basic Workflow

1. **Add a Role** (optional): Click "+ Add Role" or 👤 to pick from the library
2. **Add Context**: Click "+ Add Context" to provide background information
3. **Add Tasks**: Click "+ Add Task" to define what you want the AI to do
4. **Add Subtasks**: Click "+" on any task to break it into smaller steps
5. **Add Guardrails**: Click "+ Add Guard-rail" to set rules
6. **Copy Prompt**: Click "Copy Prompt" to use it with your AI assistant

### Keyboard Shortcuts

- **⌘+Enter** (Mac) / **Ctrl+Enter** (Windows): Add new task
- **⌘+\\** (Mac) / **Ctrl+\\** (Windows): Add context
- **⌘+]** (Mac) / **Ctrl+]** (Windows): Add guardrail

### Saving & Loading

- **Save**: Click "💾 Save" to store your prompt
- **New**: Click "✨ New" to start fresh
- **Load**: Click any saved prompt in the history sidebar
- **Delete**: Select prompts and click "🗑️ Delete"

## Examples

### Example 1: Technical Writer

**Role**: Technical Writer (Skills: Documentation, Markdown)

**Context**: Writing documentation

**Tasks**:

- Write clear documentation
  - Max Tokens: 800
  - Response Type: concise
  - Format: markdown
  - **Subtasks**:
    - Add examples

**Guardrails**:

- Use simple language
- Keep in sync with code

**Generated Prompt (Text)**:

```text
ROLE:
Technical Writer
Skills: Documentation, Markdown

CONTEXT:
1. Writing documentation

TASKS:
Task 1: Write clear documentation
   [Config: Max Tokens: 800, Response Type: concise, Format: markdown]
   SubTask: Add examples

GUARD-RAILS:
1. Use simple language
2. Keep in sync with code
```

### Example 2: Bug Fix

**Role**: Backend Developer (Skills: Python, Debugging)

**Context**: Fixing a bug

**Tasks**:

1. Find root cause
2. Implement fix
3. Add test to prevent regression

**Guardrails**:

- No breaking changes
- Minimal code changes

## Task Configuration Options

Each task and subtask can be configured with:

- **Max Tokens**: Limit the response length (e.g., 500)
- **Response Type**:
  - Code
  - Explanation
  - Step-by-step
  - Detailed
  - Concise
  - Bullet Points
- **Format**:
  - Markdown
  - Plain Text
  - JSON
  - XML

## Templates

Pre-built templates available:

- **New Feature**: Full-stack feature implementation
- **Bug Fix**: Systematic debugging workflow
- **Refactor**: Code quality improvement
- **Code Review**: Technical review process
- **API Integration**: External API setup
- **Documentation**: Technical writing

## Technical Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Storage**: IndexedDB (browser-based)
- **Styling**: CSS (custom)

## Project Structure

```plaintext
src/
├── App.tsx         # Main application component
├── App.css         # Application styles
├── db.ts           # IndexedDB storage utilities
├── templates.ts    # Template and library definitions
└── main.tsx        # Application entry point
```

## Data Storage

All prompts are stored locally in your browser using IndexedDB. No data is sent to external servers.

## License

MIT
