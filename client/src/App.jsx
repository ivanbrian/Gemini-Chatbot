import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import InputBar from './components/InputBar.jsx';
import { useChat } from './hooks/useChat.js';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const SESSIONS_KEY = 'gemini_sessions';
const MODEL_KEY = 'gemini_model';
const PROMPT_KEY = 'gemini_system_prompt';
const THEME_KEY = 'gemini_theme';

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || []; }
  catch { return []; }
}

function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL);
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem(PROMPT_KEY) || '');
  const [sessions, setSessions] = useState(loadSessions);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const { messages, isStreaming, error, sendMessage, cancelStream, clearMessages, loadMessages } =
    useChat({ model, systemPrompt });

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  // Persist model
  useEffect(() => { localStorage.setItem(MODEL_KEY, model); }, [model]);

  // Persist system prompt
  useEffect(() => { localStorage.setItem(PROMPT_KEY, systemPrompt); }, [systemPrompt]);

  // Auto-save current session whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;

    const title = messages[0]?.content?.slice(0, 40) || 'New Chat';

    setSessions((prev) => {
      const id = currentSessionId || Date.now().toString();
      if (!currentSessionId) setCurrentSessionId(id);

      const existing = prev.find((s) => s.id === id);
      const updated = existing
        ? prev.map((s) => s.id === id ? { ...s, messages, title } : s)
        : [{ id, title, messages, createdAt: Date.now() }, ...prev];

      saveSessions(updated);
      return updated;
    });
  }, [messages, currentSessionId]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setCurrentSessionId(null);
    setSidebarOpen(false);
  }, [clearMessages]);

  const handleLoadSession = useCallback((session) => {
    loadMessages(session.messages);
    setCurrentSessionId(session.id);
    setSidebarOpen(false);
  }, [loadMessages]);

  const handleDeleteSession = useCallback((id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSessions(next);
      return next;
    });
    if (currentSessionId === id) {
      clearMessages();
      setCurrentSessionId(null);
    }
  }, [currentSessionId, clearMessages]);

  return (
    <div className={`${dark ? 'dark' : ''} h-screen flex bg-zinc-950 text-zinc-100 overflow-hidden`}>
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        model={model}
        onModelChange={setModel}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">
                {error}
              </span>
            )}
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <ChatWindow messages={messages} />

        <InputBar
          onSend={sendMessage}
          onCancel={cancelStream}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
