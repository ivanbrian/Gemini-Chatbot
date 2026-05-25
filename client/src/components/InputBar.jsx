import { useRef, useEffect, useState } from 'react';
import { Send, Square } from 'lucide-react';

export default function InputBar({ onSend, onCancel, isStreaming }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Re-focus after streaming ends
  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue('');
  };

  const charCount = value.length;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Gemini... (Shift+Enter for newline)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm resize-none outline-none max-h-[140px] disabled:opacity-60"
          />

          <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
            {charCount > 0 && (
              <span className="text-xs text-zinc-600">{charCount.toLocaleString()}</span>
            )}

            {isStreaming ? (
              <button
                onClick={onCancel}
                className="p-2 rounded-xl bg-zinc-700 hover:bg-red-600/80 text-zinc-300 hover:text-white transition-colors"
                title="Cancel"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!value.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-2">
          Gemini can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
