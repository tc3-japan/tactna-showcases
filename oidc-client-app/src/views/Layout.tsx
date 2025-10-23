import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import AppBar from "../components/AppBar";
import Copyright from "../components/Copyright";
import LoadingModal from "../components/LoadingModal";
import { useAuth } from "react-oidc-context";
import { useCallback, useEffect, useMemo } from "react";
import { useOidcConfig } from "../contexts/OidcConfigContext";

export const Layout = () => {
  const auth = useAuth();
  const { clientId, signupEndpoint, postSignupRedirectUri, updateConfig } = useOidcConfig();

  useEffect(() => {
    if (!auth) return;
    const teamIdFromProfile = auth?.user?.profile?.["https://tactna.net/team_id"] as string;
    if (teamIdFromProfile) {
      updateConfig({ teamId: teamIdFromProfile });
    }
  }, [auth, updateConfig]);

  const onClickLogout = useCallback(() => {
    if (auth) {
      auth.signoutRedirect({ redirectTarget: "self" });
    }
  }, [auth]);

  const onForceLogout = useCallback(async () => {
    if (auth) {
      // Remove all OIDC session data from storage
      await auth.removeUser();
      // Trigger login prompt after clearing session with prompt=login
      auth.signinRedirect({ prompt: "login" });
    }
  }, [auth]);

  const signupUrl = useMemo(() => {
    const url = new URL(signupEndpoint);
    url.pathname = "/signup/start";
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("redirect_uri", postSignupRedirectUri);
    return url.toString();
  }, [signupEndpoint, clientId, postSignupRedirectUri]);

  // Safety check: if auth is not available yet, show loading
  if (!auth) {
    return (
      <LoadingModal open={true}>
        <Typography margin={3} color={"white"}>
          Initializing...
        </Typography>
      </LoadingModal>
    );
  }

  switch (auth.activeNavigator) {
    case "signinSilent":
      return (
        <LoadingModal open={true}>
          <Typography margin={3} color={"white"}>
            Signing you in...
          </Typography>
        </LoadingModal>
      );
    case "signoutRedirect":
      return (
        <LoadingModal open={true}>
          <Typography margin={3} color={"white"}>
            Signing you out...
          </Typography>
        </LoadingModal>
      );
  }

  if (auth.isLoading) {
    return (
      <LoadingModal open={true}>
        <Typography margin={3} color={"white"}>
          Loading...
        </Typography>
      </LoadingModal>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "colors.lightGray" }}>
      <AppBar
        isAuthenticated={auth.isAuthenticated}
        onClickLogin={() => auth.signinRedirect()}
        onClickLogout={onClickLogout}
        onForceLogout={onForceLogout}
        signupUrl={signupUrl}
        signupEndpoint={signupEndpoint}
      />
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <Box pb={2}>
        <Copyright />
      </Box>
      <LoadingModal open={auth.isLoading} />
    </Box>
  );
};

export default Layout;
