import { Link, useLocation } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

const Error = () => {
  const auth = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const error = params.get("error") || auth.error?.name;
  const errorDescription =
    params.get("error_description") ||
    auth.error?.message ||
    "An unknown error occurred.";

    useEffect(() => {
        if (auth.error) {
            auth.removeUser();
        }
    }, [auth.error]);

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px", textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Error
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
