import {
  Box,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import AppBar from "../components/AppBar";
import Copyright from "../components/Copyright";
import LoadingModal from "../components/LoadingModal";
import { useAuth } from "react-oidc-context";
import { useCallback, useEffect, useState } from "react";
import { appConfig } from "../config";

export const Layout = () => {
  const auth = useAuth();
  const [audience, setAudience] = useState<string>(appConfig.audience);
  const [teamId, setTeamId] = useState<string>("");
  const [redirectUrlOnLogin, setRedirectUrlOnLogin] = useState<string>("");
  useEffect(() => {
    const teamId = auth?.user?.profile?.["https://tactna.net/team_id"] as string
    if (teamId) {
      setTeamId(teamId);
    }
  }, [auth])
  const onClickLogin = useCallback(() => {
    auth.signinRedirect({
      extraQueryParams: {
        audience: audience,
        team_id: teamId,
      },
      state: redirectUrlOnLogin,
    });
  }, [auth, audience, teamId, redirectUrlOnLogin]);



  // const authDisplay = () => {
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
        onClickLogin={onClickLogin}
        onClickLogout={() => auth.signoutRedirect({ redirectTarget: "self" })}
        onClickSignup={() => {
          window.location.href = `${appConfig.signupEndpoint}?client_id=${appConfig.clientId}&redirect_uri=${appConfig.postSignupRedirectUri}`
        }}
      />
      {
        <Stack alignItems="flex-end" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Parameters
          </Typography>
          <TextField
            label="Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="https://showcase.tactna.gigops-dev.net"
            sx={{ width: "340px" }}
          />
          <TextField
            label="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="892ef6b5-da05-4748-8ea1-cd7cdb567643"
            sx={{ width: "340px" }}
          />
          <TextField
            label="Redirect URL on Login"
            value={redirectUrlOnLogin}
            onChange={(e) => setRedirectUrlOnLogin(e.target.value)}
            placeholder="https://example.com"
            sx={{ width: "340px" }}
          />
          </Box>
        </Stack>
      }
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
