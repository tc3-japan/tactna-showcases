import {
  Alert,
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
import { useLocation } from "react-router";
import { buildSignInArgs } from "../utils";

export const Layout = () => {
  const auth = useAuth();
  const search = useLocation().search;
  const [teamId, setTeamId] = useState<string>(
    new URLSearchParams(search).get("teamId") ?? ""
  );
  const [jti, setJti] = useState<string>("");

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

  if (auth.error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Alert severity="error">
          Oops...
          <br />
          {auth.error?.message ?? "Something went wrong here."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "colors.lightGray" }}>
      <AppBar
        isAuthenticated={auth.isAuthenticated}
        onClickLogin={() => auth.signinRedirect(buildSignInArgs(teamId, jti))}
        onClickLogout={() => auth.signoutRedirect({ redirectTarget: "self" })}
      />
      {!auth.isAuthenticated && (
        <Stack direction="column" alignItems="flex-end">
          <TextField
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="teamId"
            sx={{ width: "340px" }}
          />
          <TextField
            value={jti}
            onChange={(e) => setJti(e.target.value)}
            placeholder="jti"
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
