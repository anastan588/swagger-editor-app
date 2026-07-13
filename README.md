# 🖋️ Swagger Editor App

[![Production Deployment](https://shields.io)](https://swagger-editor-404-team.vercel.app/)
[![Next.js](https://shields.io)](https://nextjs.org)
[![React](https://shields.io)](https://react.dev)
[![Tailwind v4](https://shields.io)](https://tailwindcss.com)
[![Vitest](https://shields.io)](https://vitest.dev)

A modern, cloud-synced Web Application for editing, validating, and managing Swagger/OpenAPI specifications. Built with performance, accessibility, and clean architecture in mind.

🔗 **Live Production URL**: [https://swagger-editor-404-team.vercel.app/](https://swagger-editor-404-team.vercel.app/)

---

## ✨ Features

- **Real-time Parsing & Validation**: Instant YAML and JSON parsing using `js-yaml` and `yaml` engines.
- **Robust Authentication**: Secure sign-in and sign-up routines powered by Supabase SSR.
- **Full Internationalization (i18n)**: Seamless language routing and locale management using `next-intl`.
- **Advanced Code Editing**: Dedicated interface engineered for managing complex OpenAPI schemas.
- **Responsive Adaptive Design**: Built natively with Tailwind CSS v4 and fluid accessible primitives from Shadcn UI.

---

## 🛠️ Tech Stack & Architecture

### Core Engineering

- **Framework**: Next.js 16 (App Router with localized paths)
- **Library**: React 19 (Concurrent rendering advantages)
- **Database & Auth**: Supabase JS & `@supabase/ssr`

### Styling & Design System

- **Design Core**: Tailwind CSS v4 & Shadcn UI
- **Icons**: Lucide React
- **Dynamic Classes**: `clsx`, `tailwind-merge`, and `class-variance-authority` (CVA)

### Quality Assurance & Testing

- **Testing Runner**: Vitest 4
- **DOM Utilities**: React Testing Library & Happy-DOM / JSDOM
- **Code Standards**: ESLint 9, Prettier 3, and Husky Git Hooks

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js v20+** installed on your operating system.

### 2. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/anastan588/swagger-editor-app
cd swagger-editor-app
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and append your Supabase connection strings:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Local Development

Launch the local development engine with fast refresh:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📜 Automation Scripts

Run these scripts inside the root folder via `npm run <script-name>`:

| Script          | Command                 | Purpose                                               |
| :-------------- | :---------------------- | :---------------------------------------------------- |
| `dev`           | `next dev`              | Launches the hot-reloading development server         |
| `build`         | `next build`            | Standard production build compilation                 |
| `start`         | `next start`            | Spins up the optimized production server              |
| `lint`          | `eslint`                | Evaluates syntax irregularities and pattern errors    |
| `format:fix`    | `prettier --write .`    | Automatically formats codebase stylesheets and syntax |
| `test`          | `vitest`                | Executes component test pipelines in watch mode       |
| `test:coverage` | `vitest run --coverage` | Generates a V8 execution code coverage metric report  |
| `prepare`       | `husky`                 | Configures and wires local Git hook actions           |

---

## 🧪 Testing and Quality Control

### Execution Mode

This project uses **Vitest** for assertions. To run local test suites continuously during development:

```bash
npm run test
```

### Coverage Reports

To analyze written statement coverage across components (`sign-in-form`, `sign-up-form`, `code-editor`), compile metrics using:

```bash
npm run test:coverage
```

---

## 📁 Core Directory Structure

```text
├── .github/                 # GitHub actions workflows and issue templates
├── .husky/                  # Automated pre-commit git hooks
├── app/                     # Next.js App Router root layout pages
│   ├── __tests__/           # Isolated unit and component test scopes
│   ├── [locale]/            # Localized routing path structure (next-intl)
│   ├── api/                 # Next.js Route Handlers (API endpoints)
│   ├── components/          # Features or page-specific UI blocks
│   ├── context/             # Global React Context providers
│   ├── hooks/               # Custom localized React Hooks
│   ├── utils/               # App-scoped helper functions
│   └── global-error.tsx     # Global emergency boundary error handling
├── components/              # Shared generic UI components (e.g., Shadcn primitives)
├── coverage/                # Generated automated test metric matrices
├── i18n/                    # Localized translation setup and configuration configurations
├── lib/                     # Global libraries setups (e.g., Supabase client utilities)
├── messages/                # Translation dictionary data stores
│   ├── en.json              # English localization keys
│   └── ru.json              # Russian localization keys
└── public/                  # Static file assets (SVGs, icons)
├── .env                     # Local infrastructure environment variables
├── components.json          # Shadcn CLI component layer mapping setup
├── eslint.config.mjs        # Modern ESLint 9 Flat Configuration rules
├── next.config.ts           # Next.js native build compiler properties
├── postcss.config.mjs       # Tailwind CSS v4 post-processing engines
├── setupTests.ts            # Global Vitest configuration & DOM injection setup
├── tsconfig.json            # Strict TypeScript compiler type constraints
└── vitest.config.mts        # Vitest module testing orchestration pipeline
```

---

## 👥 Contributors

- **Anastasiya Andronava** ([@anastan588](https://github.com/anastan588)) — Core Developer
- **Tatsiana Hladkaya** ([@t-gladkaya](https://github.com/t-gladkaya)) — Core Developer
- **Artem Hlopov** ([@artemhlopov](https://github.com/artemhlopov)) — Core Developer
- **Yahor Shulha** ([@egor-alexandrovich](https://github.com/egor-alexandrovich)) — Mentor / Code Reviewer
