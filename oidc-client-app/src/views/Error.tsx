import { Link, useLocation } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

interface ErrorExtra {
  error: string;
  error_description: string;
}

const Error = () => {
  const auth = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isErrorExtra = (obj: any): obj is ErrorExtra => {
    return obj && 'error' in obj;
  };

  let errorExtra: ErrorExtra | undefined;
  if (isErrorExtra(auth.error)) {
    errorExtra = auth.error;
  }

  const error = params.get("error") || errorExtra?.error || auth.error?.name;
  const errorDescription =
    params.get("error_description") ||
    errorExtra?.error_description ||
    auth.error?.message ||
    "An unknown error occurred.";

  useEffect(() => {
    if (auth.error) {
      auth.removeUser();
    }
  }, [auth]);

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Error occurred
      </Typography>
      <Typography variant="h4" color="error" gutterBottom>
        {error}
      </Typography>
      <Typography variant="body1">{errorDescription}</Typography>
      <Box mt={4}>
        {/* <Button variant="contained" color="primary" onClick={handleGoBackToHome}> */}
        <Button variant="contained" color="primary" component={Link} to="/">
          Go back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Error;
