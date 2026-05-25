import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, AlertCircle } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-lg text-sm my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="bg-zinc-700 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
        {children}
      </a>
    );
  },
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isStreaming = message.role === 'model' && message.content === '' && !message.error;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
          }`}
        >
          {message.error ? (
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{message.error}</span>
            </div>
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : isStreaming ? (
            <div className="flex items-center gap-1 py-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none prose-dark
              prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
              prose-headings:text-zinc-100 prose-strong:text-zinc-100
              prose-blockquote:border-indigo-500 prose-blockquote:text-zinc-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-xs text-zinc-500">{timeAgo(message.timestamp)}</span>
          {!isUser && message.content && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={message.content} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
