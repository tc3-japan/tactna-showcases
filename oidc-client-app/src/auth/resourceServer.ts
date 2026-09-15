import { AuthContextProps } from 'react-oidc-context';
import { decodeToken } from 'react-jwt';

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

  /** Whatever the API said, for the message. Bodies here are short or absent. */
  const detail = async (response: Response) => {
    const body = await response.text().catch(() => '');
    return body ? ` — ${body.slice(0, 200)}` : '';
  };

  /** What the token is actually valid for, which is what a 401 is usually about. */
  const audienceOf = (accessToken?: string): string => {
    const aud = (decodeToken(accessToken ?? '') as { aud?: string | string[] } | null)?.aud;
    const list = Array.isArray(aud) ? aud : aud ? [aud] : [];
    return list.length ? list.join(', ') : 'none';
  };

  try {
    // Kept so the message can report the audience of the token that was
    // actually refused, not the one the context happens to hold by then.
    let sentToken = auth.user?.access_token;
    let response = await send(sentToken);

    if (response.status === 401) {
      const renewed = await auth.signinSilent().catch(() => null);
      if (!renewed) {
        return fail('The session has ended. Log in again to continue.');
      }
      sentToken = renewed.access_token;
      response = await send(sentToken);
    }

    // A refused *fresh* token is not about the token's age, and the app cannot
    // tell the remaining causes apart (which audience this API wants, whether
    // the account still has access, whether the endpoint exists here). Report
    // what it can see -- the token's audience and the API's own answer -- and
    // let the reader decide.
    if (response.status === 401) {
      return fail(
        `The API refused this token (401). Token audience: ${audienceOf(sentToken)}.${await detail(response)}`,
      );
    }
    if (response.status === 403) {
      return fail(`This account may not perform this operation (403).${await detail(response)}`);
    }
    if (!response.ok) {
      return fail(`${response.status} ${response.statusText}${await detail(response)}`, true);
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), true);
  }
};
