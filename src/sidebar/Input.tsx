import { useState, useRef, type KeyboardEvent } from 'react';
import { BRAND_ORANGE } from '../shared/constants';

interface InputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function Input({ onSend, disabled }: InputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-100 shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-gray-300 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask MiniMe..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none min-h-[20px] max-h-[120px] leading-5 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
          style={{
            backgroundColor: value.trim() && !disabled ? BRAND_ORANGE : '#e5e7eb',
          }}
          title="Send (Enter)"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5"
            stroke={value.trim() && !disabled ? 'white' : '#9ca3af'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13V3M3 8l5-5 5 5" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-center">
        Shift+Enter for new line
      </div>
    </div>
  );
}
