import { useState, useEffect, useCallback } from 'react';
import Chat from './Chat';
import Header from './Header';
import SignIn from './SignIn';
import type { DocContext, Message, UserProfile, LoadingState, PanelSize } from '../shared/types';
import type { ExtensionMessage } from '../shared/types';
import { STORAGE_KEYS, makeSessionKey } from '../shared/constants';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [docContext, setDocContext] = useState<DocContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [panelSize, setPanelSize] = useState<PanelSize>('side');
  const [authLoading, setAuthLoading] = useState(true);

  // Load user profile
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: 'GET_USER_PROFILE' } satisfies ExtensionMessage,
      (profile: UserProfile | null) => {
        setUserProfile(profile);
        setAuthLoading(false);
      }
    );
  }, []);

  // Get doc context from active tab's content script
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_DOC_CONTEXT' } satisfies ExtensionMessage,
        (ctx: DocContext | null) => {
          if (chrome.runtime.lastError) return; // no content script on this tab
          if (ctx) setDocContext(ctx);
        }
      );
    });
  }, []);

  // Load conversation for current doc
  useEffect(() => {
    if (!docContext) return;
    const key = `${STORAGE_KEYS.conversationPrefix}${docContext.docId}`;
    chrome.storage.local.get(key, (result) => {
      const saved = result[key] as Message[] | undefined;
      if (saved?.length) setMessages(saved);
      else setMessages([]);
    });
  }, [docContext?.docId]);

  // Save conversation on change
  useEffect(() => {
    if (!docContext || messages.length === 0) return;
    const key = `${STORAGE_KEYS.conversationPrefix}${docContext.docId}`;
    // Don't persist streaming messages
    const toSave = messages.filter((m) => !m.streaming);
    chrome.storage.local.set({ [key]: toSave });
  }, [messages, docContext]);

  // Listen for stream events from background
  useEffect(() => {
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    const listener = (message: ExtensionMessage) => {
      switch (message.type) {
        case 'STREAM_CHUNK': {
          if (slowTimer) clearTimeout(slowTimer);
          if (searchTimer) clearTimeout(searchTimer);
          setLoadingState('streaming');
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.streaming) {
              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  content: last.content + message.chunk,
                  sources: message.sources ?? last.sources,
                },
              ];
            }
            return [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: message.chunk,
                sources: message.sources,
                timestamp: Date.now(),
                streaming: true,
              },
            ];
          });
          break;
        }

        case 'STREAM_DONE': {
          if (slowTimer) clearTimeout(slowTimer);
          if (searchTimer) clearTimeout(searchTimer);
          setLoadingState('idle');
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.streaming) {
              return [
                ...prev.slice(0, -1),
                { ...last, streaming: false, sources: message.sources ?? last.sources },
              ];
            }
            return prev;
          });
          break;
        }

        case 'STREAM_ERROR': {
          if (slowTimer) clearTimeout(slowTimer);
          if (searchTimer) clearTimeout(searchTimer);
          setLoadingState('idle');
          setMessages((prev) => [
            ...prev.filter((m) => !m.streaming),
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `⚠️ ${message.error}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        }

        case 'DOC_CONTEXT': {
          setDocContext(message.context);
          break;
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
      if (slowTimer) clearTimeout(slowTimer);
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || loadingState !== 'idle' || !userProfile) return;

      const docId = docContext?.docId ?? 'unknown';
      const sessionKey = makeSessionKey(userProfile.email, docId);

      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Set loading — searching label appears after delay
      setLoadingState('thinking');
      const searchTimer = setTimeout(() => setLoadingState('searching'), 500);
      const slowTimer = setTimeout(() => setLoadingState('slow'), 8000);

      // Send to background
      chrome.runtime.sendMessage({
        type: 'SEND_MESSAGE',
        message: text,
        sessionKey,
      } satisfies ExtensionMessage);

      // Store timers on window to clear in listener (hack for closure)
      (window as Window & { _searchTimer?: ReturnType<typeof setTimeout>; _slowTimer?: ReturnType<typeof setTimeout> })._searchTimer = searchTimer;
      (window as Window & { _searchTimer?: ReturnType<typeof setTimeout>; _slowTimer?: ReturnType<typeof setTimeout> })._slowTimer = slowTimer;
    },
    [loadingState, userProfile, docContext]
  );

  const handleSignIn = useCallback(() => {
    setAuthLoading(true);
    chrome.runtime.sendMessage(
      { type: 'GET_USER_PROFILE' } satisfies ExtensionMessage,
      (profile: UserProfile | null) => {
        setUserProfile(profile);
        setAuthLoading(false);
      }
    );
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-1">
          <div className="dot w-2 h-2 bg-gray-300 rounded-full" />
          <div className="dot w-2 h-2 bg-gray-300 rounded-full" />
          <div className="dot w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header
        docContext={docContext}
        panelSize={panelSize}
        onPanelSizeChange={setPanelSize}
        userProfile={userProfile}
      />
      <Chat
        messages={messages}
        loadingState={loadingState}
        userProfile={userProfile}
        docContext={docContext}
        onSend={handleSend}
      />
    </div>
  );
}
