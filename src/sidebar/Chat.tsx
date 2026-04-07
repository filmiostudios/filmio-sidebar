import { useEffect, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import ThinkingIndicator from './ThinkingIndicator';
import EmptyState from './EmptyState';
import type { DocContext, LoadingState, Message as MessageType, UserProfile } from '../shared/types';

interface ChatProps {
  messages: MessageType[];
  loadingState: LoadingState;
  userProfile: UserProfile;
  docContext: DocContext | null;
  onSend: (text: string) => void;
}

export default function Chat({
  messages,
  loadingState,
  userProfile,
  docContext,
  onSend,
}: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const showEmpty = messages.length === 0 && loadingState === 'idle';
  const showThinking = loadingState === 'thinking' || loadingState === 'searching' || loadingState === 'slow';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {showEmpty ? (
          <EmptyState userProfile={userProfile} docContext={docContext} onSend={onSend} />
        ) : (
          <>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {showThinking && <ThinkingIndicator state={loadingState} />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <Input
        onSend={onSend}
        disabled={loadingState !== 'idle'}
      />
    </div>
  );
}
