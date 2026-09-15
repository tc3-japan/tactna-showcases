/**
 * How to read what Tactna says when authorization fails.
 *
 * Two rules the whole app follows:
 *
 * 1. **Branch on `error`, never on `error_description`.** The code is the stable
 *    contract; the description is human-readable text whose wording changes
 *    without notice. Show it, log it, decide nothing on it.
 * 2. **Never start a new login automatically.** Every failure here survives a
 *    retry (the account, the team or the request is the problem), so retrying by
 *    itself is an infinite redirect loop. Offer the user a button.
 */
export interface AuthErrorInfo {
  /** The `error` code as received, or the exception name for a failed renewal. */
  code: string;
  /** `error_description`, for display and logs only. */
  description: string;
  summary: string;
  /** Only a fresh request can fix these; everything else needs a decision. */
  canRetryLogin: boolean;
}

const SUMMARY: Record<string, string> = {
  access_denied:
    'This account cannot use this app in the requested team. Ask an administrator for access, or log in with another account.',
  invalid_request:
    'The login request was not accepted. It may have expired (the login page was left open too long), or a value in it is not registered for this app.',
  server_error: 'Tactna could not complete the request. Try again in a moment.',
  session_expired: 'The session has ended. Log in again to continue.',
};

const describe = (code: string, description: string): AuthErrorInfo => ({
  code,
  description,
  summary: SUMMARY[code] ?? 'The login could not be completed.',
  canRetryLogin: code === 'invalid_request' || code === 'session_expired',
});

/**
 * The failure to show, from the authorization response Tactna redirected back
 * with, or from the auth state. A state error with no OAuth code is a renewal
 * that failed — the refresh token is spent or revoked, i.e. the session ended.
 */
export const readAuthError = (search: string, stateError?: Error | null): AuthErrorInfo | null => {
  const params = new URLSearchParams(search);
  const code = params.get('error');
  if (code) {
    return describe(code, params.get('error_description') ?? '');
  }
  if (!stateError) {
    return null;
  }
  const oauth = stateError as Error & { error?: string; error_description?: string };
  return oauth.error
    ? describe(oauth.error, oauth.error_description ?? stateError.message)
    : describe('session_expired', stateError.message);
};
