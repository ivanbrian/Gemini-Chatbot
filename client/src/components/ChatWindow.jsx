import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import { Bot } from 'lucide-react';

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">Gemini Chatbot</h2>
        <p className="text-zinc-500 text-sm max-w-sm">
          Start a conversation. Your messages are sent with full history so Gemini can remember context.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
