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
import { useCallback, useMemo } from "react";
import { useSettings } from "../auth/TactnaAuthProvider";
import { buildSignupUrl } from "../utils";
import { readRequestedTeamIdFromUrl, useRequestedTeam } from "../hooks/useRequestedTeam";

export const Layout = () => {
  // Tenant-specific: only for tenants whose authority is Auth0, where the
  // session is ended through Auth0's own /v2/logout. Tactna tenants leave this
  // unset.
  const useV2LogoutForForceLogout = import.meta.env.VITE_USE_V2_LOGOUT_FOR_FORCE_LOGOUT === "true";

  const auth = useAuth();
  const settings = useSettings();
  const { authority, clientId, signupEndpoint, postSignupRedirectUri } = settings;

  // The URL, not the stored config: a team left over from the previous visit
  // must not be re-requested for whoever signs in next.
  useRequestedTeam(auth, settings, readRequestedTeamIdFromUrl());


  // Logout: ends the Tactna session as well as this app's. oidc-client-ts sends
  // the `id_token_hint` Tactna requires, and returns to
  // post_logout_redirect_uri — which has to be registered on the client.
  const onClickLogout = useCallback(() => {
    auth.signoutRedirect({ redirectTarget: "self" });
  }, [auth]);

  // Force Logout: drops this app's tokens only — the Tactna session survives —
  // and asks for a credential again with `prompt=login`. Useful for testing a
  // second account; it is not a logout, and the refresh token stays valid until
  // it is revoked (POST /revoke_token) or expires.
  const onForceLogout = useCallback(async () => {
    await auth.removeUser();
    if (useV2LogoutForForceLogout) {
      const logoutUrl = new URL("/v2/logout", authority);
      logoutUrl.searchParams.append("client_id", clientId);
      logoutUrl.searchParams.append("returnTo", window.location.origin);
      window.location.href = logoutUrl.toString();
      return;
    }
    await auth.signinRedirect({ prompt: "login" });
  }, [auth, useV2LogoutForForceLogout, authority, clientId]);

  const signupUrl = useMemo(
    () => buildSignupUrl(signupEndpoint, clientId, postSignupRedirectUri),
    [signupEndpoint, clientId, postSignupRedirectUri],
  );

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
