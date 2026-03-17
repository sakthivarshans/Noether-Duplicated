<div align="center">

<br/>

# 🎓 Noether

### *Your AI-powered companion for smarter, calmer studying.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.x-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Genkit_1.20-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **Noether** is a full-stack AI study platform named after the legendary mathematician **Emmy Noether**. It fuses **Google Gemini AI**, **Firebase**, and a rich set of productivity tools into a single, elegant workspace built for modern students.

<br/>

</div>

---

## 📖 Table of Contents

- [✨ Why Noether?](#-why-noether)
- [🚀 Feature Highlights](#-feature-highlights)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Prerequisites](#️-prerequisites)
- [📦 Setup & Installation](#-setup--installation)
  - [1 · Clone the Repository](#1--clone-the-repository)
  - [2 · Firebase Project Setup](#2--firebase-project-setup)
  - [3 · Root Application (Main Next.js App)](#3--root-application-main-nextjs-app)
  - [4 · Standalone Backend Service](#4--standalone-backend-service)
  - [5 · Standalone Frontend (Alternate UI)](#5--standalone-frontend-alternate-ui)
- [▶️ Running the Application](#️-running-the-application)
- [🔐 Environment Variables Reference](#-environment-variables-reference)
- [📁 Project Structure](#-project-structure)
- [🎨 Design Philosophy](#-design-philosophy)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Why Noether?

Most study apps do one thing. **Noether does everything.**

Instead of juggling ten different tools — a timer here, a note-taker there, a flashcard app somewhere else — Noether consolidates your entire study session into one beautifully crafted workspace. Built on top of Google's cutting-edge Gemini AI, it doesn't just store your content; it **understands** it, summarizes it, quizzes you on it, and plans your schedule around it.

---

## 🚀 Feature Highlights

| Feature | Description |
|---|---|
| 🔐 **Google Auth** | Seamless sign-in with Google OAuth via Firebase Authentication |
| 🏠 **Dashboard** | Card-based overview with motivational quotes, quick-nav, and session stats |
| 📄 **Document AI** | Upload `.pdf` / `.pptx` files → get instant summaries, key topics, flashcards & flowcharts powered by Gemini |
| 🃏 **Flashcard Generator** | AI-generated flashcard decks from any uploaded document |
| ❓ **PYQ Answer Engine** | Upload Past Year Question papers and receive detailed, structured answers via Gemini |
| 📅 **Timetable Generator** | Auto-builds balanced study schedules based on subjects, hours, and breaks; saved to Firestore |
| ✅ **To-Do & Reminders** | Task manager with deadline tracking and optional **Google Calendar** integration |
| 🎙️ **Voice-to-Text Notes** | Real-time voice transcription with edit, save, `.txt` / `.docx` download support |
| ⏱️ **Pomodoro Timer** | Classic 25/5 focus-break cycle with floating overlay and background operation |
| 💤 **Power Nap Alarm** | Set a nap duration; wake up with a math problem alarm that forces you to engage your brain |
| 🧠 **Brain Games** | Memory and puzzle games with score tracking and leaderboard integration |
| 🎵 **Focus Music Player** | Curated instrumental playlist with controls and background audio playback via **Tone.js** |
| 🔍 **Topic Search** | Intelligent topic search powered by Google Programmable Search or Gemini |
| 🗺️ **Learning Roadmap** | AI-generated learning roadmaps for any subject or skill |
| 📊 **Insights** | Personal study analytics and progress charts powered by **Recharts** |
| 🧬 **Schema Generator** | Generate data schemas and diagrams from natural language descriptions |
| 🧑 **User Profile** | Editable profile with name, college, degree, skills, projects, and hobbies, synced to Firebase |

---

## 🏗️ Architecture Overview

```
noether-duplicated/
│
├── src/                   ← Root Next.js 15 application (Primary)
│   ├── app/               ← App Router pages (dashboard, login, signup…)
│   ├── ai/                ← Google Genkit AI flows & configuration
│   ├── components/        ← Reusable Radix UI + shadcn/ui components
│   ├── context/           ← React Context providers (Auth, Theme…)
│   ├── firebase/          ← Firebase client SDK init & helpers
│   ├── hooks/             ← Custom React hooks
│   └── lib/               ← Utility functions
│
├── backend/               ← Standalone Node.js / Express API server
│   └── src/
│       ├── firebase/      ← Firebase Admin SDK initialisation
│       ├── genkit/        ← Genkit AI flow wrappers
│       ├── middleware/    ← Firebase JWT auth middleware
│       ├── routes/        ← Express route handlers
│       └── server.js      ← Entry point (port 3001)
│
├── frontend/              ← Alternate lightweight Next.js 14 frontend
│   └── pages/             ← Pages Router (connects to backend API on port 3001)
│
└── docs/
    ├── blueprint.md       ← Original feature specification
    └── backend.json       ← API schema / documentation
```

> **Which app do I run?**  
> The **root (`src/`) Next.js 15 app** is the primary, feature-complete application — it communicates directly with Firebase and calls Genkit AI flows internally.  
> The **`backend/` + `frontend/`** directories form an alternative decoupled architecture (Node.js API + Next.js 14 UI) that is useful for scenarios requiring a separate deployable API service (e.g., Render + Vercel).

---

## 🛠️ Tech Stack

### Primary Application

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **AI / LLM** | Google Genkit 1.20 · Gemini API |
| **Auth & DB** | Firebase Authentication · Cloud Firestore |
| **UI Components** | Radix UI Primitives · shadcn/ui |
| **Styling** | Tailwind CSS 3 · tailwindcss-animate |
| **Charts** | Recharts |
| **Audio** | Tone.js |
| **Forms** | React Hook Form · Zod |
| **Date Utilities** | date-fns |
| **Carousel** | Embla Carousel |

### Backend Service (Standalone)

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (ESM) |
| **Framework** | Express 4 |
| **AI** | Google Genkit 1.20 · Gemini API |
| **Auth Verification** | Firebase Admin SDK 12 |
| **Schema Validation** | Zod |
| **Dev Server** | Nodemon |

---

## ⚙️ Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** ≥ 18.x ([download](https://nodejs.org/))
- **npm** ≥ 9.x (bundled with Node.js)
- A **Firebase** project ([console.firebase.google.com](https://console.firebase.google.com/))
- A **Google AI / Gemini API key** ([aistudio.google.com](https://aistudio.google.com/))

---

## 📦 Setup & Installation

### 1 · Clone the Repository

```bash
git clone https://github.com/your-username/noether-duplicated.git
cd noether-duplicated
```

---

### 2 · Firebase Project Setup

> Do this **once** — both the root app and the backend service share the same Firebase project.

1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** → **Sign-in method** → **Google**.
3. Enable **Cloud Firestore** in production or test mode.
4. **Web App Config** (for the frontend):
   - Go to **Project Settings → General → Your apps** → Add a web app.
   - Copy the `firebaseConfig` object — you'll need these values for `.env`.
5. **Service Account Key** (for the backend):
   - Go to **Project Settings → Service accounts** → **Generate new private key**.
   - Keep the downloaded JSON file secure — you'll extract values from it for the backend `.env`.

---

### 3 · Root Application (Main Next.js App)

This is the **primary** Noether application.

```bash
# From the project root
npm install
```

Create a `.env.local` file in the **project root**:

```env
# Google Gemini / Genkit
GOOGLE_API_KEY=your_google_ai_api_key_here

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

### 4 · Standalone Backend Service

The decoupled Express API server that the alternate frontend consumes.

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in the values:

```env
# Google Gemini / Genkit
GOOGLE_API_KEY=your_google_ai_api_key_here

# Firebase Admin SDK (from your Service Account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Port
PORT=3001
```

> ⚠️ **Important:** The `FIREBASE_PRIVATE_KEY` must be wrapped in double quotes and have literal `\n` for newlines as shown above.

---

### 5 · Standalone Frontend (Alternate UI)

The lightweight Next.js 14 frontend that proxies AI calls through the backend service.

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/` (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then fill in the values:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Firebase Client Configuration (same values as root app)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

## ▶️ Running the Application

### Option A — Primary App Only (Recommended)

Everything runs in a single Next.js process with internal Genkit AI flows:

```bash
# From the project root
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it! 🎉

To also run the **Genkit Developer UI** (inspect & test AI flows interactively):

```bash
# In a separate terminal, from the project root
npm run genkit:dev
```

The Genkit Dev UI opens at [http://localhost:4000](http://localhost:4000).

---

### Option B — Decoupled Architecture (Backend + Frontend)

Run the backend and frontend independently (requires two terminals):

**Terminal 1 – Backend API Server:**

```bash
cd backend
npm run dev    # Development (auto-reloads with Nodemon) → http://localhost:3001
# or
npm start      # Production
```

**Terminal 2 – Alternate Frontend:**

```bash
cd frontend
npm run dev    # → http://localhost:3000
```

---

### Production Build (Root App)

```bash
npm run build
npm start
```

> Note: The `build` script sets `NODE_ENV=production` automatically.

---

## 🔐 Environment Variables Reference

### Root App (`/.env.local`)

| Variable | Required | Description |
|---|:---:|---|
| `GOOGLE_API_KEY` | ✅ | Google AI Studio API key for Gemini / Genkit |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage bucket URL |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app identifier |

### Backend (`/backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `GOOGLE_API_KEY` | ✅ | Google AI Studio API key for Gemini / Genkit |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID (from Service Account) |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Service Account client email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Service Account private key (in quotes, with `\n`) |
| `PORT` | ➖ | Server port, defaults to `3001` |

### Alternate Frontend (`/frontend/.env.local`)

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_BACKEND_URL` | ✅ | Base URL of the backend API service |
| `NEXT_PUBLIC_FIREBASE_*` | ✅ | Same Firebase client config as root app |

---

## 📁 Project Structure

```
noether-duplicated/
│
├── src/
│   ├── ai/
│   │   ├── dev.ts                   # Genkit dev server entry
│   │   └── flows/                   # Individual Genkit AI flows
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── flashcards/          # Flashcard viewer & generator
│   │   │   ├── games/               # Brain games (memory, puzzles)
│   │   │   ├── insights/            # Study analytics & charts
│   │   │   ├── music/               # Focus music player
│   │   │   ├── pomodoro/            # Pomodoro timer
│   │   │   ├── power-nap/           # Power nap alarm
│   │   │   ├── pyq/                 # Past Year Questions answerer
│   │   │   ├── quiz/                # AI-generated quiz
│   │   │   ├── roadmap/             # Learning roadmap generator
│   │   │   ├── schema/              # Schema diagram generator
│   │   │   ├── search/              # Topic search engine
│   │   │   ├── timetable/           # Study schedule builder
│   │   │   ├── todo/                # To-do list & reminders
│   │   │   ├── upload/              # Document upload & AI processing
│   │   │   └── page.tsx             # Main dashboard
│   │   ├── login/                   # Google Sign-In page
│   │   ├── signup/                  # Account registration
│   │   └── layout.tsx               # Root layout with providers
│   ├── components/
│   │   └── ui/                      # Radix UI / shadcn component library
│   ├── context/                     # AuthContext, ThemeContext, etc.
│   ├── firebase/                    # Firebase client SDK setup
│   ├── hooks/                       # useAuth, custom hooks
│   └── lib/                         # cn(), date utils, etc.
│
├── backend/
│   └── src/
│       ├── firebase/admin.js         # Firebase Admin SDK init
│       ├── genkit/                   # Genkit AI flow definitions
│       ├── middleware/auth.js         # JWT verification middleware
│       ├── routes/                   # Express route modules
│       └── server.js                 # App entry point
│
├── frontend/
│   ├── lib/                          # Firebase client (v10)
│   ├── pages/                        # Next.js Pages Router
│   └── styles/                       # Global CSS
│
├── docs/
│   ├── blueprint.md                  # Feature specification document
│   └── backend.json                  # API contract & schema
│
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind theme & plugin config
├── tsconfig.json                     # TypeScript configuration
├── components.json                   # shadcn/ui registry config
├── firestore.rules                   # Firestore security rules
└── apphosting.yaml                   # Firebase App Hosting config
```

---

## 🎨 Design Philosophy

Noether is built around the concept of **calm productivity**. The interface is deliberately soft, soothing, and distraction-free:

- **Primary:** Light lavender `#E6E6FA` — calming and focused
- **Background:** Soft beige `#F5F5DC` — warm, readable, fatigue-free
- **Accent:** Pale blue `#ADD8E6` — subtle, non-intrusive calls-to-action
- **Body Font:** [Inter](https://fonts.google.com/specimen/Inter) — clean, modern, highly legible
- **Headline Font:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) — distinctive personality for titles
- **Motion:** Subtle hover effects, smooth page transitions, and a gentle pulse on the Pomodoro timer

The card-based dashboard layout ensures every tool is exactly **one click away**, while responsive grids reflow gracefully across desktop and mobile.

---

## 🤝 Contributing

Contributions are warmly welcome! Here's how to get started:

1. **Fork** this repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

*Made with ❤️ in the spirit of Emmy Noether — who proved that the deepest symmetries give rise to the greatest laws.*

</div>
