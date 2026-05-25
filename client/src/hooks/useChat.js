import { useState, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat({ model, systemPrompt }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (userInput) => {
      if (!userInput.trim() || isStreaming) return;

      setError(null);

      const userMsg = {
        id: makeId(),
        role: 'user',
        content: userInput.trim(),
        timestamp: Date.now(),
      };

      const assistantId = makeId();
      const assistantMsg = {
        id: assistantId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };

      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, assistantMsg]);
      setIsStreaming(true);

      // Build Gemini-format history
      const geminiHistory = nextMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: geminiHistory,
            systemPrompt: systemPrompt || undefined,
            model,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;

            try {
              const parsed = JSON.parse(raw);
              if (typeof parsed === 'string') {
                fullContent += parsed;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );
              } else if (parsed?.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          // cancelled by user — leave partial content
        } else {
          setError(err.message || 'Something went wrong');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: '', error: err.message || 'Failed to get response' }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, model, systemPrompt]
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const loadMessages = useCallback((msgs) => {
    setMessages(msgs);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, cancelStream, clearMessages, loadMessages };
}
