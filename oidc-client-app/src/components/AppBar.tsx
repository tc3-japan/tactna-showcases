import { AppBar, AppBarProps, Button, Toolbar, Divider } from '@mui/material';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

export interface CustomAppBarProps extends AppBarProps {
  isAuthenticated: boolean;
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>;
  onClickLogout: React.MouseEventHandler<HTMLButtonElement>;
  onForceLogout: React.MouseEventHandler<HTMLButtonElement>;
  signupUrl: string;
  signupEndpoint: string;
}

export const CustomAppBar = ({ isAuthenticated, onClickLogin, onClickLogout, onForceLogout, signupUrl, signupEndpoint, ...appBarProps }: CustomAppBarProps) => {
  const showLinksMenu = import.meta.env.VITE_SHOW_LINKS_MENU === "true";
  const showResourcesMenu = import.meta.env.VITE_SHOW_RESOURCES_MENU === "true";

  return (
    <Box sx={{ flexGrow: 1 }} {...appBarProps}>
      <AppBar position="static" sx={{ bgcolor: 'common.white' }}>
        <Toolbar>
          <Link to="/">
            <img src="/logo.svg" alt="logo" />
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          {showResourcesMenu && <>
            <Divider orientation="vertical" flexItem />
            <Button component={Link} to="/resources">
              Resources
            </Button>
          </>}
          <Divider orientation="vertical" flexItem />
          <Button component={Link} to="/profile">
            Profile
          </Button>
          {showLinksMenu && <>
            <Divider orientation="vertical" flexItem />
            <Button component={Link} to="/links">
              Links
            </Button>
          </>}
          <Divider orientation="vertical" flexItem />
          <Button onClick={onClickLogin} color="secondary">
            { isAuthenticated ? "Re-Login" : "Login" }
          </Button>
          {isAuthenticated && <>
            <Divider orientation="vertical" flexItem />
            <Button onClick={onClickLogout} color="secondary">Logout</Button>
          </>}
          <Divider orientation="vertical" flexItem />
          <Button onClick={onForceLogout} color="error">Force Logout</Button>
          {signupEndpoint && (<>
          <Divider orientation="vertical" flexItem />
          <Button component="a" href={signupUrl} color="secondary">
            Signup
          </Button>
          </>)}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomAppBar;
