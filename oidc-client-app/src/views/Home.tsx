import { Stack, Typography } from '@mui/material';

export const Home = () => {
  return (
    <Stack alignItems="center" spacing={2}>
      <img src="/react.svg" alt="React logo" height={80} />
      <Typography variant="h5">Tactna Sample App</Typography>
      <p>ver. 20240806_1730</p>
    </Stack>
  );
};

export default Home;
