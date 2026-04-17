// Backend endpoints
export const OC_BASE_URL = 'https://gateway.filmio.cloud';
export const OC_HOOK_ENDPOINT = `${OC_BASE_URL}/hooks/agent`;
export const OC_HEALTH_ENDPOINT = `${OC_BASE_URL}/health`;

// Service token — not a user secret, scoped to this service only
export const OC_HOOK_TOKEN = 'h7zqD9pK6vT4nR8sW3yA5cJ1mX0eLqU';

// Session key format: sidebar-{userEmail}-{docId}
export const makeSessionKey = (email: string, docId: string): string =>
  `sidebar-${email}-${docId}`;

// Storage keys
export const STORAGE_KEYS = {
  userProfile: 'userProfile',
  conversationPrefix: 'conv_',
} as const;

// UI timings (ms)
export const TIMINGS = {
  searchingLabelDelay: 500,
  slowThreshold: 8000,
  loadingIndicatorMax: 100,
} as const;

// Default suggested prompts (v0.1 — hardcoded; v0.2 will use Haiku to generate doc-aware ones)
export const DEFAULT_SUGGESTIONS = [
  'Summarize this doc',
  'What does the KB say about GoScore methodology?',
  'Is anything here inconsistent with other Filmio docs?',
] as const;

// Panel width percentages
export const PANEL_SIZES = {
  side: '25%',
  wide: '40%',
  full: '50%',
} as const;

// Google OAuth — Chrome Extension client (registered 2026-04-10)
// Extension ID: gejiddohjgogedgjnonbofjigllpkmbf
export const GOOGLE_CLIENT_ID = '93431059074-mmtuoag0e5h8de26kirhmkte03og4e3p.apps.googleusercontent.com';

// Filmio brand color
export const BRAND_ORANGE = '#FF633D';

// Domain restriction
// TODO: enforce filmio.studio domain before team rollout
export const ALLOWED_DOMAIN = 'filmio.studio';
