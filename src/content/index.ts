// Content script — injected into docs.google.com/document/*
// Reads doc context and relays to background/sidebar

import { extractDocContext } from './docReader';
import type { ExtensionMessage } from '../shared/types';

// Send doc context to sidebar on load and on URL change
function broadcastDocContext(): void {
  const context = extractDocContext();
  if (!context) return;

  chrome.runtime.sendMessage({
    type: 'DOC_CONTEXT',
    context,
  } satisfies ExtensionMessage);
}

// Listen for requests from the sidebar
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'GET_DOC_CONTEXT') {
    const context = extractDocContext();
    sendResponse(context);
    return false;
  }
  return false;
});

// Broadcast on load
broadcastDocContext();

// Watch for Google Docs SPA navigation (doc ID changes without full reload)
let lastDocId = extractDocContext()?.docId ?? '';
const observer = new MutationObserver(() => {
  const context = extractDocContext();
  if (context && context.docId !== lastDocId) {
    lastDocId = context.docId;
    broadcastDocContext();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
