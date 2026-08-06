# 📊 Tradición Financial System - Dues & Financial Ledger

An executive-grade financial management platform, performer monthly dues tracker, and automated payment intake system designed for organizations, dance troupes, and non-profits.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC.svg?logo=tailwind-css)

---

## ✨ Key Features

- **📱 Bento Grid Dashboard**: Real-time KPI metrics, collection health indicators, payment activity feeds, and interactive visual charts.
- **💰 Performer Dues Tracker**: Manage monthly dues, custom performer rates, payment status (Paid, Pending, Overdue, Excluded), and balance calculations across billing cycles.
- **📩 Automated Gmail Sync**: Connect Google/Gmail accounts to scan payment notification emails (Zelle, Venmo, PayPal, CashApp) and convert them directly into verified ledger entries.
- **📊 Google Apps Script Live Sync**: Sync ledger data bi-directionally with Google Sheets for cloud backup and live spreadsheet reporting.
- **🤖 Gemini AI Diagnostics**: Leverage Google's `@google/genai` API for automated financial ledger auditing, anomaly detection, and system health insights.
- **🌐 Bilingual UI**: Instant full-application localization toggle between **English** and **Spanish**.
- **🎨 Modern Dark/Light Theme**: Built with glassmorphism, fluid micro-interactions, Recharts data visualization, and Motion transition animations.

---

## 🛠️ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Framer Motion](https://motion.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Authentication & Cloud**: [Firebase Auth](https://firebase.google.com/), Google Apps Script
- **AI & Diagnostics**: [@google/genai](https://www.npmjs.com/package/@google/genai) SDK

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** or **bun** / **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/monthly-dues.git
   cd monthly-dues
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key and application settings:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
   ```

4. **Configure Firebase (Optional for Auth & Gmail Sync)**:
   Copy `firebase-applet-config.example.json` to `firebase-applet-config.json`:
   ```bash
   cp firebase-applet-config.example.json firebase-applet-config.json
   ```
   Update with your Firebase project credentials.

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server on port `3000` |
| `npm run build` | Builds production bundle with Vite |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Performs TypeScript type checking |
| `npm run clean` | Cleans build output directory (`dist`) |

---

## 📁 Directory Overview

```
monthly-dues/
├── .github/              # GitHub Actions CI workflows
│   └── workflows/
│       └── ci.yml
├── public/               # Static assets & icons
├── src/
│   ├── components/       # UI Components (Bento Dashboard, Modals, Views)
│   ├── context/          # React Contexts (Language, Theme)
│   ├── data/             # Default data sets & initial state
│   ├── lib/              # Firebase configuration & auth helpers
│   ├── services/         # Apps Script & Gmail sync service integrations
│   ├── utils/            # Accounting logic, date formatters, sanitizers, translations
│   ├── App.tsx           # Main application router & view switcher
│   ├── index.css         # Tailwind v4 configuration & global styles
│   └── main.tsx          # Application entrypoint
├── .env.example          # Template environment configuration
├── firebase-applet-config.example.json # Firebase config template
├── index.html            # Main HTML document template
├── package.json          # Dependencies & npm scripts
├── tsconfig.json         # TypeScript compiler configuration
└── vite.config.ts        # Vite bundling configuration
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
