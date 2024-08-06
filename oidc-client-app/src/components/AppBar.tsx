import { AppBar, AppBarProps, Button, Toolbar, useTheme } from '@mui/material';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { appConfig } from '../config.tsx';

export interface CustomAppBarProps extends AppBarProps {
  isAuthenticated: boolean;
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>;
  onClickLogout: React.MouseEventHandler<HTMLButtonElement>;
  onClickSignup: React.MouseEventHandler<HTMLButtonElement>;
}

export const CustomAppBar = ({ isAuthenticated, onClickLogin, onClickLogout, onClickSignup, ...appBarProps }: CustomAppBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const logo = isMobile ? '/logo.svg' : '/logo-with-text.svg';

  return (
    <Box sx={{ flexGrow: 1 }} {...appBarProps}>
      <AppBar position="static" sx={{ bgcolor: 'common.white' }}>
        <Toolbar>
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          {!isAuthenticated && (
            <Button onClick={onClickLogin}>
              Login
            </Button>
          )}
          {!isAuthenticated && appConfig.signupEndpoint && (<>
            <Button onClick={onClickSignup}>
              Signup
            </Button>
          </>)}
          {isAuthenticated && (
            <Button component={Link} to="/resources">
              Resources
            </Button>
          )}
          {isAuthenticated && (
            <Button component={Link} to="/profile">
              Profile
            </Button>
          )}
          {isAuthenticated && <Button onClick={onClickLogout}>Logout</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomAppBar;
