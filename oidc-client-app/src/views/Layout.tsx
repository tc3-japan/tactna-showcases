import { Box, Container, Stack, TextField } from "@mui/material";
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
  const [teamId, setTeamId] = useState<string>((new URLSearchParams(search)).get("teamId") ?? "");
  const [jti, setJti] = useState<string>("");

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
