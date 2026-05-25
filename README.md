# Gemini Chatbot

A full-stack AI chatbot powered by Google Gemini. Built with React (Vite) + TailwindCSS on the frontend and Express on the backend. Supports multi-turn conversations, streaming responses, multiple Gemini models, chat session history, and a customizable system prompt — all in a clean dark UI.

## How it works

- The React frontend manages conversation state and sends the full message history to the Express backend on each message
- The backend forwards the history to the Gemini API using the `@google/generative-ai` SDK and streams the response back via SSE (Server-Sent Events)
- The frontend reads the stream in real-time and appends tokens as they arrive, giving a live typing effect
- Chat sessions are saved to `localStorage` — no database needed
- The backend is fully stateless

## Features

- Multi-turn conversation with full history sent to Gemini on each request
- Streaming responses with a live typing indicator
- Markdown rendering in assistant messages (code blocks, lists, bold, etc.)
- Syntax-highlighted code blocks
- Dark theme by default with light mode toggle (saved to `localStorage`)
- Sidebar with chat session list (stored in `localStorage`)
- New chat button
- Model selector: `gemini-2.0-flash`, `gemini-2.5-pro-preview-05-06`, `gemini-1.5-pro`
- Copy button on each assistant message
- Relative timestamps on messages
- Custom system prompt — collapsible panel in sidebar, persisted in `localStorage`
- Mobile-responsive layout with hamburger sidebar toggle
- Cancel mid-stream with AbortController
- Graceful error display

## Prerequisites

- Node.js 18+
- A Google Gemini API key

## Getting started

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd gemini-chatbot

# 2. Install dependencies
npm run install:all

# 3. Set up environment variables
cp .env.example server/.env
# Then open server/.env and fill in GEMINI_API_KEY

cp .env.example client/.env
# VITE_API_BASE_URL is already set to http://localhost:3001

# 4. Start both servers
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Getting a Gemini API key

Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) to create a free API key.

## Available models

| Model | Description |
|---|---|
| `gemini-2.0-flash` | Fast, efficient — good for most conversations (default) |
| `gemini-2.5-pro-preview-05-06` | Most capable, best for complex reasoning tasks |
| `gemini-1.5-pro` | Balanced performance and capability |

## Project structure

```
gemini-chatbot/
├── client/                   # React frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx     # Message list with auto-scroll
│   │   │   ├── MessageBubble.jsx  # Individual message with markdown
│   │   │   ├── InputBar.jsx       # Textarea + send/cancel buttons
│   │   │   ├── Sidebar.jsx        # Session list + system prompt
│   │   │   └── ModelSelector.jsx  # Gemini model dropdown
│   │   ├── hooks/
│   │   │   └── useChat.js         # All chat state and streaming logic
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Express backend (stateless)
│   ├── routes/
│   │   └── chat.js           # POST /api/chat — SSE streaming endpoint
│   ├── services/
│   │   └── gemini.js         # Gemini SDK wrapper
│   ├── index.js
│   └── package.json
│
├── .env.example              # Reference env vars (committed)
├── .gitignore
└── README.md
```

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `GEMINI_API_KEY` | Server | Your Google Gemini API key |
| `PORT` | Server | Express server port (default: `3001`) |
| `VITE_API_BASE_URL` | Client | Backend base URL (default: `http://localhost:3001`) |
