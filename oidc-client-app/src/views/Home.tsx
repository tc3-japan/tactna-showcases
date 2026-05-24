import { Stack, Typography } from '@mui/material';
import { appConfig } from '../config';
import { useOidcConfig } from '../contexts/OidcConfigContext';

export const Home = () => {
  const { currentConfigName } = useOidcConfig();
  return (
    <Stack alignItems="center" spacing={2}>
      <img src="/react.svg" alt="React logo" height={80} />
      <Typography variant="h5">{currentConfigName ?? appConfig.appName}</Typography>
      <p style={{ display: 'none' }}>ver. 20260524_1400</p>
    </Stack>
  );
};

export default Home;
