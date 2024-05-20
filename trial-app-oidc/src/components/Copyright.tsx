import { Link, Typography } from '@mui/material';

export const Copyright = () => (
  <Typography variant="body2" color="text.secondary" align="center">
    {'Copyright © '}
    <Link color="inherit">Tactna</Link> {new Date().getFullYear()}.
  </Typography>
);

export default Copyright;
