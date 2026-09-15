import { Link, useLocation } from "react-router-dom";
import { Container, Typography, Button, Box, Stack } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { useEffect, useRef } from "react";
import { readAuthError } from "../auth/errors";

/**
 * Where every authorization failure ends up. It offers an action but never takes
 * one: starting a login from here would loop for as long as the cause lasts.
 */
const Error = () => {
  const auth = useAuth();
  const location = useLocation();

  const info = readAuthError(location.search, auth.error);

  // Drop the failed session, once. `removeUser()` produces a new `auth` object
  // while `auth.error` stays set, so an unguarded effect would call it forever.
  const removed = useRef(false);
  useEffect(() => {
    if (!auth.error || removed.current) return;
    removed.current = true;
    void auth.removeUser();
  }, [auth]);

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Error occurred
      </Typography>
      <Typography variant="h6" color="error" gutterBottom>
        {info?.code ?? "unknown_error"}
      </Typography>
      <Typography variant="body1">{info?.summary ?? "An unknown error occurred."}</Typography>
      {info?.description && (
        // Shown for support, not branched on: the wording is not part of the contract.
        <Typography variant="body2" color="text.secondary" mt={1}>
          {info.description}
        </Typography>
      )}
      <Box mt={4}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" color="primary" component={Link} to="/">
            Go back to Home
          </Button>
          {info?.canRetryLogin && (
            <Button variant="outlined" onClick={() => void auth.signinRedirect()}>
              Log in again
            </Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default Error;
