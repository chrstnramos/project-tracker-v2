# STX Promo — Roadmap Tracker v2

Full-featured project management tool with real-time team sync, AI task creation, kanban board, and member dashboards.

## Features

- **Multi-project support** with sidebar switching
- **Tags** with color coding and per-tag completion tracking
- **Priority levels** (Urgent, High, Medium, Low)
- **3 views:** Timeline, Kanban Board (Overview + Focus modes), Team Dashboard
- **AI Task Creator** — paste text, Claude parses it into a structured task
- **Member Dashboard** — per-person completion rates, status/priority breakdowns
- **Quick Member Panel** — click any name for a slide-out summary
- **Search** across all tasks
- **Drag and drop** to reorder weeks and tasks
- **Duplicate** weeks and tasks
- **Collapse/Expand All** toggle
- **CSV Export**
- **Real-time sync** via Firebase (or localStorage fallback)
- **Inline editing** — click any text to edit

---

## Deploy in 5 Minutes

### Step 1: Push to GitHub

```bash
# In this project folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stx-roadmap.git
git push -u origin main
```

Or just upload the files through GitHub's web interface (drag and drop into a new repo).

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **"Add New Project"**
3. Import your `stx-roadmap` repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy**
6. Done. You get a URL like `stx-roadmap.vercel.app`

The app works immediately in **LOCAL mode** (localStorage per browser).

### Step 3: Embed in Notion

1. Open your Notion page
2. Type `/embed`
3. Paste your Vercel URL
4. Resize to full width

---

## Enable Live Team Sync (Firebase)

Without Firebase, each browser has its own data. With Firebase, everyone sees the same data in real time.

### 1. Create Firebase Project (free)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a project** → name it (e.g. `stx-roadmap`) → skip Analytics → Create

### 2. Create Realtime Database

1. Left sidebar: **Build → Realtime Database**
2. Click **Create Database**
3. Choose region → **Start in test mode** → Enable

### 3. Get Your Config

1. Click **gear icon** → **Project Settings**
2. Scroll to **"Your apps"** → click web icon (`</>`)
3. Register app (any name) → Copy the `firebaseConfig` object

### 4. Add Config to Project

Open `src/storage.js` and replace the placeholder:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "stx-roadmap-xxxxx.firebaseapp.com",
  databaseURL: "https://stx-roadmap-xxxxx-default-rtdb.firebaseio.com",
  projectId: "stx-roadmap-xxxxx",
  storageBucket: "stx-roadmap-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Then change:

```js
const USE_FIREBASE = true;
```

### 5. Push and Deploy

```bash
git add .
git commit -m "Enable Firebase sync"
git push
```

Vercel auto-redeploys in ~30 seconds. The badge in the header changes from yellow **LOCAL** to green **LIVE SYNC**.

### 6. Fix Database Rules (before 30-day expiry)

Go to Firebase Console → Realtime Database → Rules tab:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This keeps it open for your team. Add authentication later if needed.

---

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## Project Structure

```
stx-roadmap-deploy/
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── .gitignore
├── src/
│   ├── main.jsx            # React mount
│   ├── App.jsx             # Full app (all views, CRUD, AI, etc.)
│   └── storage.js          # Firebase / localStorage adapter
└── README.md
```

---

## How Sync Works

| Mode | Badge | How it works |
|------|-------|-------------|
| **LOCAL** | Yellow | localStorage per browser. No cross-device sync. |
| **LIVE SYNC** | Green | Firebase Realtime Database. Instant sync across all users. Any change by anyone appears for everyone immediately. |

With Firebase, there is no polling delay. Changes propagate via WebSocket in ~100ms.
