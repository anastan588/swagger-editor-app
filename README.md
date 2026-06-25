# Swagger Editor App

A modern Web Application for editing Swagger/OpenAPI specifications, built with Next.js 16, React 19, Tailwind CSS v4, and Shadcn UI.

---

## 🔗 Live Deployment

The application is automatically built and deployed using Vercel:

- **Production URL**: [https://swagger-editor-404-team.vercel.app/](https://swagger-editor-404-team.vercel.app/)

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & [Shadcn UI](https://shadcn.com)
- **Internationalization**: [next-intl](https://vercel.app)
- **Icons**: [Lucide React](https://lucide.dev)
- **Testing**: [Vitest](https://vitest.dev) & [React Testing Library](https://testing-library.com)
- **Code Quality**: ESLint, Prettier, Husky (Git Hooks)

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org) installed (v20+ recommended).

### 2. Installation

Clone the repository and install the project dependencies:

```bash
npm install
```

### 3. Development Server

Start the local development server with hot-reloading:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the layout.

---

## 📜 Available Scripts

Run these automation scripts inside the root directory via `npm run <script-name>`:

| Script          | Description                                                            |
| :-------------- | :--------------------------------------------------------------------- |
| `dev`           | Starts the Next.js development server on port 3000.                    |
| `build`         | Compiles and optimizes the application for production deployment.      |
| `start`         | Launches the built production application server.                      |
| `lint`          | Analyzes code structure to find and report syntax/pattern errors.      |
| `format:fix`    | Rewrites all codebase files using Prettier configuration.              |
| `test`          | Runs the Vitest test suite continuously in watch mode.                 |
| `test:coverage` | Runs all Vitest tests once and generates an execution coverage report. |
| `prepare`       | System script initializing Husky git hooks automatically.              |

---

## 🧪 Testing and Quality Control

### Run Tests

This project relies on **Vitest** for component and module assertions. Execute tests in local watch-mode:

```bash
npm run test
```

### Coverage Reports

To evaluate logic pathways covered by current written scopes, compile testing metrics via V8 compilation:

```bash
npm run test:coverage
```

### Code Formatting

To automatically adjust import sorting, brackets, and syntax formatting before committing:

```bash
npm run format:fix
```

---

## 📁 Key Project Directory Structure

```text
├── .husky/              # Git hooks management
├── app/                 # Next.js App Router root layout pages
│   ├── [locale]/        # Localized path routines (next-intl)
│   └── components/      # Shares application UI/UX block targets
├── public/              # Static file assets (SVGs, favicon)
├── tsconfig.json        # TypeScript configuration settings
└── vitest.config.ts     # Vitest pipeline test execution layouts
```

---

## 👤 Contributors

- **Anastasiya Andronava** ([@anastan588](https://github.com/anastan588)) — Developer
- **Tatsiana Hladkaya** ([@t-gladkaya](https://github.com/t-gladkaya)) — Developer
- **Artem Hlopov** ([@artemhlopov](https://github.com/artemhlopov)) — Developer
- **Yahor Shulha** ([@egor-alexandrovich](https://github.com/egor-alexandrovich)) — Mentor / Code Reviewer
