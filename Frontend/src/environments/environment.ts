export const environment = {
  production: false,
  /** Public HTTP API (Express) — default matches backend `PORT` or 5000 */
  api_public_base: 'http://localhost:5000/api',
  /** Prefill on `/login?mode=admin` only; matches seeded admin defaults */
  adminSignInPrefill: {
    email: 'admin@ailocal.test',
    password: 'AdminLocal#2026',
  },
  /**
   * When true, failed admin email/password login still sets a local admin session and routes to `/admin`.
   * Must stay false for any production build.
   */
  adminLocalBypassOnFailedLogin: true,
};
