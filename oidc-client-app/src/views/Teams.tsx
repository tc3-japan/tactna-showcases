import { Alert, Avatar, Button, Chip, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSettings } from '../auth/TactnaAuthProvider';
import { readTactnaClaims } from '../auth/claims';
import { ApiFailure } from '../auth/resourceServer';
import { AccountTeam, fetchMyTeams, switchToTeam } from '../auth/teams';

/** In-app team switcher, from `GET /v1/accounts/me/teams`. */
const Teams = () => {
  const auth = useAuth();
  const settings = useSettings();
  const currentTeamId = readTactnaClaims(auth.user)?.teamId ?? '';
  const [teams, setTeams] = useState<AccountTeam[]>([]);
  const [error, setError] = useState<ApiFailure | null>(null);

  const load = useCallback(async () => {
    const result = await fetchMyTeams(auth, settings.tactnaApiUri);
    setError(result.ok ? null : result.error);
    setTeams(result.ok ? result.data.data : []);
    // Not on `auth`: renewing a token inside the call produces a new one, and
    // reloading on that would spin against an API that keeps refusing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.tactnaApiUri]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!settings.tactnaApiUri) {
    return <Alert severity="info">Set VITE_TACTNA_API_URI to use the team switcher.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Teams of this account</Typography>
      {error && (
        <Alert severity={error.retriable ? 'warning' : 'error'} action={
          error.retriable ? <Button size="small" onClick={() => void load()}>Retry</Button> : undefined
        }>
          {error.message}
        </Alert>
      )}
      <List>
        {teams.map((team) => {
          const current = team.teamId === currentTeamId;
          return (
            <ListItem
              key={team.teamId}
              secondaryAction={
                current ? (
                  <Chip label="Current" color="primary" size="small" />
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => void switchToTeam(auth, settings, team, '/teams')}
                  >
                    Switch
                  </Button>
                )
              }
            >
              {team.iconUrl && (
                <ListItemAvatar>
                  <Avatar src={team.iconUrl} />
                </ListItemAvatar>
              )}
              <ListItemText
                primary={team.displayName ?? team.teamId}
                secondary={
                  <>
                    {team.teamId} · {team.status.type} ({team.status.code})
                    {/* Both are hints for the user, not gates: Tactna decides whether
                        this credential may enter the team when the request arrives. */}
                    {!team.authed && ' · signing in again'}
                    {team.mandatoryExternalIdp && ' · SSO only'}
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
      {!error && teams.length === 0 && <Typography>No teams to show.</Typography>}
    </Stack>
  );
};

export default Teams;
