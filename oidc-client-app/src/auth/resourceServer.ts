import { AuthContextProps } from 'react-oidc-context';

export interface ApiFailure {
  message: string;
  /** False when nothing the app can do will change the answer. */
  retriable: boolean;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiFailure };

/**
 * Calls a resource server with the current access token.
 *
 * Access tokens are short-lived (10 minutes by default), so a 401 is usually
 * just an expired token: renew once and retry. A second 401 is not about the
 * token — the membership, the team's subscription or the app's access changed —
 * and **must not** start a login, or the app loops between itself and Tactna for
 * as long as that state lasts. 403 is the resource server's own answer about
 * permissions, and never a reason to re-authenticate either.
 */
export const callResourceServer = async <T>(
  auth: AuthContextProps,
  url: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> => {
  const send = (accessToken?: string) =>
    fetch(url, {
      ...init,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });

  const fail = (message: string, retriable = false): ApiResult<T> => ({ ok: false, error: { message, retriable } });

  try {
    let response = await send(auth.user?.access_token);

    if (response.status === 401) {
      const renewed = await auth.signinSilent().catch(() => null);
      if (!renewed) {
        return fail('The session has ended. Log in again to continue.');
      }
      response = await send(renewed.access_token);
    }

    if (response.status === 401) {
      return fail('A fresh token was refused. This account may no longer have access to this app.');
    }
    if (response.status === 403) {
      return fail('This account may not perform this operation.');
    }
    if (!response.ok) {
      return fail(`${response.status} ${response.statusText}`, true);
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), true);
  }
};
