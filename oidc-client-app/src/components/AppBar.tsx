import { AppBar, AppBarProps, Button, Toolbar, useTheme, Divider } from '@mui/material';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { appConfig } from '../config.tsx';

export interface CustomAppBarProps extends AppBarProps {
  isAuthenticated: boolean;
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>;
  onClickLogout: React.MouseEventHandler<HTMLButtonElement>;
  onClickSignup: React.MouseEventHandler<HTMLButtonElement>;
}

export const CustomAppBar = ({ isAuthenticated, onClickLogin, onClickLogout, onClickSignup, ...appBarProps }: CustomAppBarProps) => {

  return (
    <Box sx={{ flexGrow: 1 }} {...appBarProps}>
      <AppBar position="static" sx={{ bgcolor: 'common.white' }}>
        <Toolbar>
          <Link to="/">
            <img src="/logo.svg" alt="logo" />
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Divider orientation="vertical" flexItem />
          <Button component={Link} to="/resources">
            Resources
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button component={Link} to="/profile">
            Profile
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button component={Link} to="/links">
            Links
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button onClick={onClickLogin} color="secondary">
            { isAuthenticated ? "Re-Login" : "Login" }
          </Button>
          {isAuthenticated && <>
            <Divider orientation="vertical" flexItem />
            <Button onClick={onClickLogout} color="secondary">Logout</Button>
          </>}
          <Divider orientation="vertical" flexItem />
          {appConfig.signupEndpoint && (<>
            <Button onClick={onClickSignup} color="secondary">
              Signup
            </Button>
          </>)}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomAppBar;
