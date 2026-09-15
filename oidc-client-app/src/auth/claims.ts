import { User } from 'oidc-client-ts';

/**
 * The `https://tactna.net/*` claims Tactna puts on the ID and access tokens.
 *
 * These are the authoritative answer to "who is signed in, in which team, with
 * which role" — read them from the token rather than keeping your own copy.
 * Only UUIDs appear here; Tactna never exposes internal ids.
 */
export interface TactnaClaims {
  tenantId: string;
  /** The account, stable across teams. */
  userId: string;
  /** This account's membership of `teamId`. Not the account itself. */
  teamMemberId: string;
  teamId: string;
  teamType: string;
  /** Role in the team. */
  role: string;
  displayName: string;
  lang: string;
  appId: string;
  /** The app's team, present once the team uses this app. */
  appTeamId: string;
  appUserId: string;
  /** Role in the app. */
  appRole: string;
  /**
   * This member's status in the app, and the team's status for this app.
   *
   * The token carries the **tenant-defined code** (`SUBSCRIBED`,
   * `AUTHORIZED_CUSTOM`, ...), not the fixed status *type* behind it, so do not
   * pattern-match these. `GET /v1/accounts/me/teams` returns both
   * (`status.type` / `status.code`) when you need to branch — see
   * `src/auth/teams.ts`. Neither is an access check: Tactna does not issue
   * tokens for a membership that may not sign in.
   */
  appStatus: string;
  appTeamStatus: string;
  /** Identifier at the external IdP, when the login came through one. */
  idpUserId: string;
}

const CUSTOM_PREFIX = 'https://tactna.net/custom/';

export const readTactnaClaims = (user?: User | null): TactnaClaims | null => {
  const profile = user?.profile as Record<string, unknown> | undefined;
  if (!profile) return null;
  const claim = (name: string): string => {
    const value = profile[`https://tactna.net/${name}`];
    return typeof value === 'string' ? value : '';
  };
  if (!claim('team_id')) return null;

  return {
    tenantId: claim('tenant_id'),
    userId: claim('global_sid'),
    teamMemberId: claim('user_id'),
    teamId: claim('team_id'),
    teamType: claim('team_type'),
    role: claim('role'),
    displayName: claim('display_name'),
    lang: claim('lang'),
    appId: claim('app_id'),
    appTeamId: claim('app/team_id'),
    appUserId: claim('app/user_id'),
    appRole: claim('app/role'),
    appStatus: claim('app/status'),
    appTeamStatus: claim('app/team_status'),
    idpUserId: claim('idp_user_id'),
  };
};

/** Custom item values the tenant configured, keyed as `<group>/<key>`. */
export const readCustomClaims = (user?: User | null): Record<string, string> =>
  Object.fromEntries(
    Object.entries((user?.profile ?? {}) as Record<string, unknown>)
      .filter(([key, value]) => key.startsWith(CUSTOM_PREFIX) && typeof value === 'string')
      .map(([key, value]) => [key.slice(CUSTOM_PREFIX.length), value as string]),
  );
