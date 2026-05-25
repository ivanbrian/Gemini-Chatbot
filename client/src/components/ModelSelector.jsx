import { ChevronDown } from 'lucide-react';

const MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast & efficient' },
  { id: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro', desc: 'Most capable' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Balanced' },
];

export default function ModelSelector({ model, onChange }) {
  return (
    <div className="relative">
      <select
        value={model}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-zinc-800 dark:bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} — {m.desc}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
    </div>
  );
}
