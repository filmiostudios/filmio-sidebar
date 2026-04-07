import type { DocContext, UserProfile } from '../shared/types';
import { DEFAULT_SUGGESTIONS, BRAND_ORANGE } from '../shared/constants';

interface EmptyStateProps {
  userProfile: UserProfile;
  docContext: DocContext | null;
  onSend: (text: string) => void;
}

export default function EmptyState({ userProfile, docContext, onSend }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 px-1 pt-2">
      {/* Greeting */}
      <div className="space-y-0.5">
        <div className="text-sm font-semibold text-gray-800">
          Hey {userProfile.firstName} 👋
        </div>
        {docContext ? (
          <div className="text-xs text-gray-400">
            I'm looking at:{' '}
            <span className="text-gray-600 font-medium">{docContext.docTitle}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400">
            Open a Google Doc to get started.
          </div>
        )}
      </div>

      {/* Prompt line */}
      <div className="text-xs text-gray-500">
        Ask me anything about this doc, the Filmio KB, or your work.
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-col gap-2 w-full">
        {DEFAULT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSend(suggestion)}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-xs text-gray-600 group"
          >
            <span className="text-gray-300 group-hover:text-gray-400 text-sm">↪</span>
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
