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

  /** Whatever the API said, for the message. Bodies here are short or absent. */
  const detail = async (response: Response) => {
    const body = await response.text().catch(() => '');
    return body ? ` — ${body.slice(0, 200)}` : '';
  };

  try {
    let response = await send(auth.user?.access_token);

    if (response.status === 401) {
      const renewed = await auth.signinSilent().catch(() => null);
      if (!renewed) {
        return fail('The session has ended. Log in again to continue.');
      }
      response = await send(renewed.access_token);
    }

    // A refused *fresh* token is not about the token's age. The usual cause is
    // that it was not minted for this API: the authorization request's
    // `audience` has to cover it, and the API verifies exactly that. The other
    // causes are the account losing access and the permission the endpoint
    // requires. The app cannot tell them apart, so it does not claim to.
    if (response.status === 401) {
      return fail(
        `The API refused this token (401). Check that the access token's audience covers this API,` +
          ` and that this account still has access to it.${await detail(response)}`,
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
