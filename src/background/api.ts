// Backend API calls and SSE streaming
// All calls go through here — never fetch from content scripts or sidebar directly

import { OC_HOOK_ENDPOINT, OC_HOOK_TOKEN } from '../shared/constants';
import type { ExtensionMessage } from '../shared/types';

interface OCSseChunk {
  chunk?: string;
  sources?: string[];
  done?: boolean;
  error?: string;
}

export async function sendToOC(
  message: string,
  sessionKey: string,
  userEmail: string
): Promise<void> {
  let sources: string[] = [];

  try {
    const res = await fetch(OC_HOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OC_HOOK_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        sessionKey,
        token: OC_HOOK_TOKEN,
        metadata: { userEmail },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      sendError(`Backend error ${res.status}: ${text}`);
      return;
    }

    const contentType = res.headers.get('content-type') ?? '';

    // Handle SSE stream
    if (contentType.includes('text/event-stream')) {
      await handleSSEStream(res, sources);
      return;
    }

    // Handle plain JSON response (non-streaming fallback)
    const data = await res.json() as { response?: string; error?: string };
    if (data.error) {
      sendError(data.error);
      return;
    }
    if (data.response) {
      sendChunk(data.response);
      sendDone(sources);
    }
  } catch (err) {
    sendError(err instanceof Error ? err.message : 'Connection failed');
  }
}

async function handleSSEStream(res: Response, sources: string[]): Promise<void> {
  if (!res.body) {
    sendError('No response body');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === '[DONE]') {
          sendDone(sources);
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr) as OCSseChunk;

          if (parsed.error) {
            sendError(parsed.error);
            return;
          }
          if (parsed.sources) {
            sources = parsed.sources;
          }
          if (parsed.chunk) {
            sendChunk(parsed.chunk, sources.length > 0 ? sources : undefined);
          }
          if (parsed.done) {
            sendDone(sources);
            return;
          }
        } catch {
          // Non-JSON SSE line — skip
        }
      }
    }

    sendDone(sources);
  } finally {
    reader.releaseLock();
  }
}

function sendChunk(chunk: string, sources?: string[]): void {
  chrome.runtime.sendMessage({
    type: 'STREAM_CHUNK',
    chunk,
    sources,
  } satisfies ExtensionMessage);
}

function sendDone(sources: string[]): void {
  chrome.runtime.sendMessage({
    type: 'STREAM_DONE',
    sources: sources.length > 0 ? sources : undefined,
  } satisfies ExtensionMessage);
}

function sendError(error: string): void {
  chrome.runtime.sendMessage({
    type: 'STREAM_ERROR',
    error,
  } satisfies ExtensionMessage);
}
