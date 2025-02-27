import { Stack, Typography } from '@mui/material';
import { appConfig } from '../config';

export const Home = () => {
  return (
    <Stack alignItems="center" spacing={2}>
      <img src="/react.svg" alt="React logo" height={80} />
      <Typography variant="h5">{appConfig.appName}</Typography>
      <p>ver. 20241019_1500</p>
    </Stack>
  );
};

export default Home;
