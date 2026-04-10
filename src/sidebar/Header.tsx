import type { DocContext, PanelSize, UserProfile } from '../shared/types';
import { BRAND_ORANGE } from '../shared/constants';

interface HeaderProps {
  docContext: DocContext | null;
  panelSize: PanelSize;
  onPanelSizeChange: (size: PanelSize) => void;
  userProfile: UserProfile;
}

const SIZES: { label: string; value: PanelSize }[] = [
  { label: 'S', value: 'side' },
  { label: 'W', value: 'wide' },
  { label: 'F', value: 'full' },
];

export default function Header({
  docContext,
  panelSize,
  onPanelSizeChange,
  userProfile,
}: HeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0"
      style={{ backgroundColor: '#fafafa' }}
    >
      {/* Left: logo + doc title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Filmio F icon */}
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          F
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-800 leading-tight">MiniMe</div>
          {docContext ? (
            <div className="text-xs text-gray-400 truncate max-w-[140px]" title={docContext.docTitle}>
              {docContext.docTitle}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No doc open</div>
          )}
        </div>
      </div>

      {/* Right: panel size toggle + user initial */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Size toggle */}
        <div className="flex border border-gray-200 rounded overflow-hidden">
          {SIZES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onPanelSizeChange(value)}
              className={`px-1.5 py-0.5 text-xs transition-colors ${
                panelSize === value
                  ? 'text-white font-medium'
                  : 'bg-white text-gray-400 hover:text-gray-600'
              }`}
              style={panelSize === value ? { backgroundColor: BRAND_ORANGE } : {}}
              title={`${value} panel`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User avatar */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
          style={{ backgroundColor: '#6b7280' }}
          title={userProfile.email}
        >
          {userProfile.firstName[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </div>
  );
}
