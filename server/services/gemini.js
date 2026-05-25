import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function streamChat({ messages, systemPrompt, model: modelName }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const modelConfig = { model: modelName || 'gemini-2.0-flash' };
  if (systemPrompt) {
    modelConfig.systemInstruction = systemPrompt;
  }

  const model = genAI.getGenerativeModel(modelConfig);

  // Split history from the last user message
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: m.parts,
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  return result.stream;
}
