import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { parseSkillsInput } from '@/services/skills';

interface Props {
  label: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function SkillTagInput({
  label,
  placeholder = 'Type a skill and press Enter',
  tags,
  onChange,
}: Props) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const parsed = parseSkillsInput(input);
    if (parsed.length > 0) {
      const existing = new Set(tags.map((t) => t.toLowerCase()));
      const additions = parsed.filter((t) => !existing.has(t.toLowerCase()));
      if (additions.length) onChange([...tags, ...additions]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition-colors min-h-[42px]">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-md bg-brand-50 text-brand-700 px-2 py-1 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-brand-400 hover:text-brand-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1 flex-1 min-w-[120px]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 border-0 outline-none text-sm bg-transparent placeholder-slate-400"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={addTag}
              className="text-brand-600 hover:text-brand-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
