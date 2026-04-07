// Google OAuth flow via chrome.identity
// TODO: enforce filmio.studio domain before team rollout (v0.2)

import type { UserProfile } from '../shared/types';

export async function handleAuth(): Promise<string | null> {
  try {
    const token = await chrome.identity.getAuthToken({ interactive: false });
    return token?.token ?? null;
  } catch {
    return null;
  }
}

export async function getAuthToken(interactive = false): Promise<string | null> {
  try {
    const result = await chrome.identity.getAuthToken({ interactive });
    return result?.token ?? null;
  } catch {
    return null;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const token = await getAuthToken(true);
  if (!token) return null;

  try {
    const res = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      // Token may be stale — remove and retry once
      await chrome.identity.removeCachedAuthToken({ token });
      const freshToken = await getAuthToken(true);
      if (!freshToken) return null;

      const retryRes = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      if (!retryRes.ok) return null;

      const data = await retryRes.json() as { email: string; name: string; given_name?: string };
      return buildProfile(data);
    }

    const data = await res.json() as { email: string; name: string; given_name?: string };
    return buildProfile(data);
  } catch {
    return null;
  }
}

function buildProfile(data: { email: string; name: string; given_name?: string }): UserProfile {
  return {
    email: data.email,
    name: data.name,
    firstName: data.given_name ?? data.name.split(' ')[0] ?? 'there',
  };
}
