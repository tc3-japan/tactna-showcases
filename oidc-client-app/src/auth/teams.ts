import { AuthContextProps } from 'react-oidc-context';
import { extraQueryParams, TactnaSettings } from './settings';
import { ApiResult, callResourceServer } from './resourceServer';

/** One row of `GET /v1/accounts/me/teams`. */
export interface AccountTeam {
  teamId: string;
  displayName: string | null;
  status: {
    /** Fixed vocabulary: AUTHORIZED, AUTHORIZING, SUSPENDED, UNAUTHORIZED, DELETED. */
    type: string;
    /** Tenant-defined code behind that type. */
    code: string;
  };
  /** True when the current credential can enter the team without signing in again. */
  authed: boolean;
  /** True when the team only accepts logins through its own external IdP. */
  mandatoryExternalIdp: boolean;
  /** Auth0 connection for this team, when the tenant is Auth0-integrated. */
  connection?: string;
  iconUrl?: string;
}

/**
 * The teams this account can switch to — every membership that shares the
 * account's login emails, not just the one the token is for.
 *
 * Needs a user token whose `aud` covers the Tactna API and the `o_member.get`
 * permission; M2M tokens are rejected.
 */
export const fetchMyTeams = (
  auth: AuthContextProps,
  tactnaApiUri: string,
): Promise<ApiResult<{ data: AccountTeam[] }>> =>
  callResourceServer(auth, `${tactnaApiUri}/v1/accounts/me/teams`);

/**
 * Switching teams is a new authorization request — there is no "switch" call.
 * Tactna decides from the parameters whether the current credential can be
 * reused or the team's IdP has to authenticate the user again.
 */
export const switchToTeam = (
  auth: AuthContextProps,
  settings: TactnaSettings,
  team: AccountTeam,
  returnTo: string,
): Promise<void> =>
  auth.signinRedirect({
    state: returnTo,
    extraQueryParams: extraQueryParams(settings, {
      team_id: team.teamId,
      // Auth0-integrated tenants select the team by connection; sending both
      // also skips the team-selection screen.
      ...(team.connection ? { connection: team.connection } : {}),
    }),
  });
