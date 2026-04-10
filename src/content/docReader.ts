// Extracts Google Doc context from the current page

import type { DocContext } from '../shared/types';

export function extractDocContext(): DocContext | null {
  const url = window.location.href;
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;

  const docId = match[1];
  const docTitle = document.title.replace(' - Google Docs', '').trim() || docId;

  return { docId, docTitle, url };
}
