import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import ModelSelector from './ModelSelector.jsx';

function timeLabel(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  model,
  onModelChange,
  systemPrompt,
  onSystemPromptChange,
  isOpen,
  onClose,
}) {
  const [promptOpen, setPromptOpen] = useState(false);

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex-shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center mt-6 px-4">
              No sessions yet. Start a conversation!
            </p>
          ) : (
            <ul className="space-y-0.5">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onLoadSession(s)}
                    className={`w-full group flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${s.id === currentSessionId
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.title}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{timeLabel(s.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom: model + system prompt */}
        <div className="flex-shrink-0 border-t border-zinc-800 p-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Model</label>
            <ModelSelector model={model} onChange={onModelChange} />
          </div>

          <div>
            <button
              onClick={() => setPromptOpen((o) => !o)}
              className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span>System Prompt</span>
              {promptOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {promptOpen && (
              <textarea
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                placeholder="e.g. You are a helpful assistant..."
                rows={4}
                className="mt-2 w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-600"
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
