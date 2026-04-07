// Background service worker — entry point
// Handles: auth, session management, API calls, message routing

import { handleAuth, getUserProfile } from './auth';
import { sendToOC } from './api';
import type { ExtensionMessage, UserProfile } from '../shared/types';
import { STORAGE_KEYS } from '../shared/constants';

// Open sidebar when action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Enable side panel on docs.google.com
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
  if (tab.url?.includes('docs.google.com/document')) {
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidebar.html',
      enabled: true,
    });
  }
});

// Message router
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case 'GET_USER_PROFILE':
        handleGetUserProfile(sendResponse);
        return true; // async

      case 'SEND_MESSAGE':
        handleSendMessage(message.message, message.sessionKey);
        sendResponse({ ok: true });
        return false;

      default:
        return false;
    }
  }
);

async function handleGetUserProfile(
  sendResponse: (profile: UserProfile | null) => void
) {
  // Check cache first
  const stored = await chrome.storage.local.get(STORAGE_KEYS.userProfile);
  if (stored[STORAGE_KEYS.userProfile]) {
    sendResponse(stored[STORAGE_KEYS.userProfile] as UserProfile);
    return;
  }

  // Auth and fetch
  const profile = await getUserProfile();
  if (profile) {
    await chrome.storage.local.set({ [STORAGE_KEYS.userProfile]: profile });
  }
  sendResponse(profile);
}

async function handleSendMessage(userMessage: string, sessionKey: string) {
  // Get user profile for the session
  const stored = await chrome.storage.local.get(STORAGE_KEYS.userProfile);
  const profile = stored[STORAGE_KEYS.userProfile] as UserProfile | undefined;

  if (!profile) {
    chrome.runtime.sendMessage({
      type: 'STREAM_ERROR',
      error: 'Not signed in. Please sign in to use MiniMe.',
    } satisfies ExtensionMessage);
    return;
  }

  await sendToOC(userMessage, sessionKey, profile.email);
}

// Initialize auth on install
chrome.runtime.onInstalled.addListener(async () => {
  await handleAuth();
});
