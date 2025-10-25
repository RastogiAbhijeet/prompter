export interface Template {
  id: string;
  name: string;
  category: string;
  contexts: string[];
  tasks: Array<{
    text: string;
    subtasks?: string[];
  }>;
  guardRails: string[];
}

export interface LibraryItem {
  id: string;
  text: string;
  category?: string;
  subtasks?: string[];
  skills?: string[];
}

export const TEMPLATES: Template[] = [
  {
    id: "feature",
    name: "New Feature",
    category: "Dev",
    contexts: ["Building a new feature"],
    tasks: [
      {
        text: "Implement the feature",
        subtasks: ["Write code", "Add tests"],
      },
    ],
    guardRails: ["Follow code standards", "Keep it simple"],
  },
  {
    id: "bug-fix",
    name: "Bug Fix",
    category: "Dev",
    contexts: ["Fixing a bug"],
    tasks: [
      {
        text: "Find root cause",
      },
      {
        text: "Implement fix",
      },
      {
        text: "Add test to prevent regression",
      },
    ],
    guardRails: ["No breaking changes", "Minimal code changes"],
  },
  {
    id: "refactor",
    name: "Refactor",
    category: "Dev",
    contexts: ["Improving code quality"],
    tasks: [
      {
        text: "Refactor code",
        subtasks: ["Improve naming", "Extract functions", "Reduce complexity"],
      },
      {
        text: "Verify tests pass",
      },
    ],
    guardRails: ["Don't change behavior", "Small increments"],
  },
  {
    id: "review",
    name: "Code Review",
    category: "Review",
    contexts: ["Reviewing code changes"],
    tasks: [
      {
        text: "Check code quality",
      },
      {
        text: "Verify tests",
      },
    ],
    guardRails: ["Be constructive", "Focus on objective issues"],
  },
  {
    id: "api",
    name: "API Integration",
    category: "Dev",
    contexts: ["Integrating with external API"],
    tasks: [
      {
        text: "Set up API client",
      },
      {
        text: "Implement endpoints with error handling",
      },
      {
        text: "Add types",
      },
    ],
    guardRails: ["Never expose API keys", "Add timeouts"],
  },
  {
    id: "docs",
    name: "Documentation",
    category: "Docs",
    contexts: ["Writing documentation"],
    tasks: [
      {
        text: "Write clear documentation",
        subtasks: ["Add examples", "Cover edge cases"],
      },
    ],
    guardRails: ["Use simple language", "Keep in sync with code"],
  },
];

// Role Library - for adding roles to context
export const ROLE_LIBRARY: LibraryItem[] = [
  {
    id: "r3",
    text: "Frontend Developer",
    category: "Frontend",
    skills: ["React", "TypeScript", "CSS", "HTML"],
  },
  {
    id: "r4",
    text: "Senior Frontend Engineer",
    category: "Frontend",
    skills: ["React", "TypeScript", "Performance Optimization", "Architecture"],
  },
  {
    id: "r5",
    text: "React Developer",
    category: "Frontend",
    skills: ["React", "Redux", "React Hooks", "Testing Library"],
  },
  {
    id: "r6",
    text: "Backend Developer",
    category: "Backend",
    skills: ["Node.js", "REST APIs", "Databases", "Authentication"],
  },
  {
    id: "r7",
    text: "Senior Backend Engineer",
    category: "Backend",
    skills: ["System Design", "Microservices", "Scalability", "Security"],
  },
  {
    id: "r8",
    text: "Node.js Developer",
    category: "Backend",
    skills: ["Express", "MongoDB", "PostgreSQL", "GraphQL"],
  },
  {
    id: "r9",
    text: "Full Stack Developer",
    category: "FullStack",
    skills: ["React", "Node.js", "Databases", "REST APIs"],
  },
  {
    id: "r10",
    text: "Senior Full Stack Engineer",
    category: "FullStack",
    skills: ["System Architecture", "DevOps", "Cloud Services", "CI/CD"],
  },
  {
    id: "r11",
    text: "DevOps Engineer",
    category: "DevOps",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines"],
  },
  {
    id: "r12",
    text: "Senior DevOps Engineer",
    category: "DevOps",
    skills: [
      "Infrastructure as Code",
      "Monitoring",
      "Security",
      "Cloud Architecture",
    ],
  },
  {
    id: "r13",
    text: "Blockchain Developer",
    category: "Blockchain",
    skills: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts"],
  },
  {
    id: "r14",
    text: "Senior Blockchain Engineer",
    category: "Blockchain",
    skills: ["Protocol Design", "DeFi", "Security Audits", "Layer 2"],
  },
  {
    id: "r15",
    text: "Smart Contract Developer",
    category: "Blockchain",
    skills: ["Solidity", "Hardhat", "Testing", "Gas Optimization"],
  },
  {
    id: "r16",
    text: "ML Engineer",
    category: "AI",
    skills: ["Python", "TensorFlow", "PyTorch", "Model Deployment"],
  },
  {
    id: "r17",
    text: "Senior AI Engineer",
    category: "AI",
    skills: ["Deep Learning", "NLP", "Computer Vision", "MLOps"],
  },
  {
    id: "r18",
    text: "Data Scientist",
    category: "AI",
    skills: ["Python", "Statistics", "Data Analysis", "ML Algorithms"],
  },
  {
    id: "r19",
    text: "Mobile Developer",
    category: "Mobile",
    skills: ["React Native", "iOS", "Android", "Mobile UI/UX"],
  },
  {
    id: "r20",
    text: "iOS Developer",
    category: "Mobile",
    skills: ["Swift", "SwiftUI", "UIKit", "Xcode"],
  },
  {
    id: "r21",
    text: "Android Developer",
    category: "Mobile",
    skills: ["Kotlin", "Jetpack Compose", "Android SDK", "Material Design"],
  },
];

// Library of individual items users can pick and choose
export const CONTEXT_LIBRARY: LibraryItem[] = [
  {
    id: "c1",
    text: "Working on React/TypeScript project",
    category: "Frontend",
  },
  { id: "c2", text: "Using Node.js backend", category: "Backend" },
  {
    id: "c3",
    text: "Need to maintain backward compatibility",
    category: "General",
  },
];

export const TASK_LIBRARY: LibraryItem[] = [
  {
    id: "t1",
    text: "Implement feature",
    subtasks: ["Write code", "Add tests", "Update docs"],
    category: "Dev",
  },
  {
    id: "t2",
    text: "Fix bug",
    subtasks: ["Find root cause", "Implement fix", "Add test"],
    category: "Dev",
  },
  { id: "t3", text: "Write unit tests", category: "Testing" },
  { id: "t4", text: "Write integration tests", category: "Testing" },
  { id: "t5", text: "Add error handling", category: "Dev" },
];

export const GUARDRAIL_LIBRARY: LibraryItem[] = [
  { id: "g1", text: "Follow existing code style", category: "Code Quality" },
  { id: "g2", text: "No breaking changes", category: "Compatibility" },
  { id: "g3", text: "Keep it simple", category: "Code Quality" },
  {
    id: "g4",
    text: "Add comments for complex logic",
    category: "Code Quality",
  },
  {
    id: "g5",
    text: "Ensure accessibility (ARIA labels, keyboard nav)",
    category: "Accessibility",
  },
  { id: "g6", text: "Never expose API keys or secrets", category: "Security" },
  { id: "g7", text: "Validate all user inputs", category: "Security" },
  { id: "g8", text: "Handle all error cases", category: "Reliability" },
  { id: "g9", text: "Keep bundle size minimal", category: "Performance" },
  { id: "g10", text: "Test on multiple browsers", category: "Compatibility" },
  { id: "g11", text: "Make it mobile-friendly", category: "UX" },
  { id: "g12", text: "Use TypeScript strict mode", category: "Code Quality" },
  { id: "g13", text: "Don't repeat yourself (DRY)", category: "Code Quality" },
  { id: "g14", text: "Update tests for changes", category: "Testing" },
  { id: "g15", text: "Document breaking changes", category: "Documentation" },
];
