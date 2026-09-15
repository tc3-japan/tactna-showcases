import { AuthProviderProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';
import { assert } from '../utils';

/**
 * Everything this app needs to talk to Tactna. The only interface the
 * application code depends on — the debug panel under `src/devtools` supplies a
 * different instance of it at runtime, and nothing else changes.
 */
export interface TactnaSettings {
  appName: string;
  authority: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  signupEndpoint: string;
  postSignupRedirectUri: string;
  audience: string;
  resourceServerUri: string;
  /** Base URL of the Tactna app API (v1), e.g. `https://api.<tenant>.tactna.net`. */
  tactnaApiUri: string;
  /** Team to log in to, from `?team_id=`. Empty means "any team". */
  teamId: string;
  /** External IdP to use, from `?identity_provider=`. Empty means "let the user choose". */
  federationId: string;
}

const url = new URL(window.location.href);

export const envSettings: TactnaSettings = {
  appName: import.meta.env.VITE_APP_NAME || 'Tactna Sample App',
  authority: assert(import.meta.env.VITE_OIDC_AUTHORITY),
  clientId: assert(import.meta.env.VITE_OIDC_CLIENT_ID),
  redirectUri: import.meta.env.VITE_OIDC_REDIRECT_SIGN_IN || window.location.origin,
  postLogoutRedirectUri: import.meta.env.VITE_OIDC_REDIRECT_SIGN_OUT || window.location.origin,
  signupEndpoint: import.meta.env.VITE_SIGNUP_ENDPOINT,
  postSignupRedirectUri: import.meta.env.VITE_REDIRECT_SIGN_UP || window.location.origin,
  audience: import.meta.env.VITE_AUDIENCE,
  resourceServerUri: assert(import.meta.env.VITE_RESOURCE_SERVER_URI),
  tactnaApiUri: import.meta.env.VITE_TACTNA_API_URI || '',
  teamId: url.searchParams.get('team_id')?.trim() ?? '',
  federationId: url.searchParams.get('identity_provider')?.trim() ?? '',
};

/**
 * The authorization request parameters beyond the OIDC basics.
 *
 * `signinRedirect(args)` *replaces* the provider's `extraQueryParams` rather than
 * merging, so anything starting a one-off request (the team switcher) builds its
 * parameters from here instead of listing only what it wants to change.
 */
export const extraQueryParams = (
  settings: TactnaSettings,
  overrides: Record<string, string> = {},
): Record<string, string> => {
  const params: Record<string, string> = {};
  // Comma-separated when the app calls more than one API with the same token.
  if (settings.audience) {
    params.audience = settings.audience;
  }
  // Which team to log in to. Tactna answers with the login screen's team picker
  // when this login cannot enter it.
  if (settings.teamId) {
    params.team_id = settings.teamId;
  }
  // Skips the IdP chooser and goes straight to this external IdP.
  if (settings.federationId) {
    params.identity_provider = settings.federationId;
  }
  return { ...params, ...overrides };
};

export const buildAuthProviderProps = (settings: TactnaSettings): AuthProviderProps => {
  return {
    // Session model: access/ID tokens live ~10 minutes, and Tactna issues a
    // refresh token with them (no `offline_access` scope needed), good for as
    // long as the Tactna session lasts — 30 days by default. oidc-client-ts
    // renews with that refresh token before the token expires.
    //
    // The usual alternative, a hidden iframe with `prompt=none`, CANNOT work
    // here: the Tactna session cookie is SameSite=Strict, so it is not sent
    // from an iframe on this app's origin. Renewal is refresh-token only.
    authority: settings.authority,
    client_id: settings.clientId,
    redirect_uri: settings.redirectUri,
    post_logout_redirect_uri: settings.postLogoutRedirectUri,
    scope: 'openid email',
    extraQueryParams: extraQueryParams(settings),
    onSigninCallback: (user: User | void): void => {
      const returnTo = user?.state as string | undefined;
      if (returnTo) {
        window.location.replace(returnTo);
        return;
      }
      // Drop the consumed response, so a reload is not taken for a second
      // callback (the code is already spent). The app's own parameters stay.
      const url = new URL(window.location.href);
      ['code', 'state', 'error', 'error_description', 'session_state', 'iss'].forEach((p) =>
        url.searchParams.delete(p),
      );
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    },
  };
};
