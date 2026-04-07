import type { LoadingState } from '../shared/types';

interface ThinkingIndicatorProps {
  state: LoadingState;
}

const STATUS_LABELS: Partial<Record<LoadingState, string>> = {
  searching: 'Searching KB...',
  slow: 'Taking longer than usual...',
};

export default function ThinkingIndicator({ state }: ThinkingIndicatorProps) {
  const label = STATUS_LABELS[state];

  return (
    <div className="flex items-start gap-2">
      {/* MiniMe avatar */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: '#FF633D' }}
      >
        M
      </div>

      <div className="flex flex-col gap-1 px-3 py-2 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100">
        {/* Three dots */}
        <div className="flex gap-1 items-center h-4">
          <div className="dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
          <div className="dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
          <div className="dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
        </div>

        {/* Status label */}
        {label && (
          <div className="text-xs text-gray-400">{label}</div>
        )}
      </div>
    </div>
  );
}
