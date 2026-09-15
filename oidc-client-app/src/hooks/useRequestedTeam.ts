import { useEffect } from 'react';
import { AuthContextProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';
import { readTactnaClaims } from '../auth/claims';
import { extraQueryParams, TactnaSettings } from '../auth/settings';

/** The team this page load asks for. Read from the URL, never from a snapshot. */
export const readRequestedTeamIdFromUrl = (): string =>
  new URLSearchParams(window.location.search).get('team_id')?.trim() ?? '';

/** The team the current tokens were issued for. */
export const teamIdOfUser = (user?: User | null): string => readTactnaClaims(user)?.teamId ?? '';

const attemptKey = (teamId: string) => `tactna.team_switch_attempted:${teamId}`;

/**
 * Switch teams when the URL asks for a team other than the one in the current
 * tokens.
 *
 * A team is requested by putting `team_id` on the authorization request, so a
 * switch needs a *new* authorization request. `withAuthenticationRequired` does
 * not start one while a valid token is in storage, which is why an already
 * signed-in visit would otherwise keep the previous team.
 *
 * Only Tactna decides whether the switch is allowed; this asks once per
 * requested team (a refused team comes back as a different one, and asking again
 * would loop).
 */
export const useRequestedTeam = (
  auth: AuthContextProps,
  settings: TactnaSettings,
  requestedTeamId: string,
): void => {
  // Destructured because `auth` is a new object on every state change, and an
  // effect depending on it would re-run without end.
  const { isAuthenticated, isLoading, activeNavigator, error, signinRedirect, user } = auth;
  const currentTeamId = teamIdOfUser(user);

  useEffect(() => {
    if (!requestedTeamId || !isAuthenticated || isLoading || activeNavigator || error) {
      return;
    }
    if (!currentTeamId || currentTeamId === requestedTeamId) {
      sessionStorage.removeItem(attemptKey(requestedTeamId));
      return;
    }
    if (sessionStorage.getItem(attemptKey(requestedTeamId))) {
      return;
    }
    sessionStorage.setItem(attemptKey(requestedTeamId), '1');
    // Ask for the team the URL names, not whatever the provider was built with:
    // `signinRedirect(args)` replaces extraQueryParams, so they are rebuilt here.
    // `state` returns the user to the page they opened.
    signinRedirect({
      state: `${window.location.pathname}${window.location.search}`,
      extraQueryParams: extraQueryParams(settings, { team_id: requestedTeamId }),
    }).catch((e) => console.error('Failed to switch team:', e));
  }, [
    requestedTeamId,
    currentTeamId,
    settings,
    isAuthenticated,
    isLoading,
    activeNavigator,
    error,
    signinRedirect,
  ]);
};
