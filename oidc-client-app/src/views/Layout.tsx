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
import { useState } from "react";
import { appConfig } from "../config";

export const Layout = () => {
  const auth = useAuth();
  const [audience, setAudience] = useState<string>(appConfig.audience ?? "");

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
        onClickLogin={() => {
          auth.signinRedirect(
            audience ? { extraQueryParams: { audience } } : undefined
          );
        }}
        onClickLogout={() => auth.signoutRedirect({ redirectTarget: "self" })}
        onClickSignup={() => {
          window.location.href = `${appConfig.signupEndpoint}?client_id=${appConfig.clientId}&redirect_uri=${appConfig.postSignupRedirectUri}`
        }}
      />
      {!auth.isAuthenticated && (
        <Stack direction="column" alignItems="flex-end">
          <TextField
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="audience"
            sx={{ width: "340px" }}
          />
        </Stack>
      )}
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
