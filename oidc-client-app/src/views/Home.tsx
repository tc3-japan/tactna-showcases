import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useSettings } from '../auth/TactnaAuthProvider';
import { readTactnaClaims } from '../auth/claims';

export const Home = () => {
  const { appName } = useSettings();
  const auth = useAuth();
  // The team of the current tokens — the authoritative answer to "where am I".
  const claims = readTactnaClaims(auth.user);

  return (
    <Stack alignItems="center" spacing={2}>
      <img src="/react.svg" alt="React logo" height={80} />
      <Typography variant="h5">{appName}</Typography>
      {claims && (
        <Stack alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Current team: {claims.teamId}
          </Typography>
          <Button variant="outlined" component={Link} to="/teams">
            Switch team
          </Button>
        </Stack>
      )}
      <p style={{ display: 'none' }}>ver. 20260703_1050</p>
    </Stack>
  );
};

export default Home;
