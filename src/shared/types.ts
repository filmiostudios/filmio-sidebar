export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: number;
  streaming?: boolean;
}

export interface DocContext {
  docId: string;
  docTitle: string;
  url: string;
}

export interface UserProfile {
  email: string;
  name: string;
  firstName: string;
}

export type LoadingState = 'idle' | 'thinking' | 'searching' | 'slow' | 'streaming';

export type PanelSize = 'side' | 'wide' | 'full';

// Messages passed between content script, background, and sidebar
export type ExtensionMessage =
  | { type: 'DOC_CONTEXT'; context: DocContext }
  | { type: 'GET_DOC_CONTEXT' }
  | { type: 'SEND_MESSAGE'; message: string; sessionKey: string }
  | { type: 'STREAM_CHUNK'; chunk: string; sources?: string[] }
  | { type: 'STREAM_DONE'; sources?: string[] }
  | { type: 'STREAM_ERROR'; error: string }
  | { type: 'USER_PROFILE'; profile: UserProfile }
  | { type: 'GET_USER_PROFILE' }
  | { type: 'AUTH_REQUIRED' };
