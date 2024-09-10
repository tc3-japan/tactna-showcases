import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Stack, Typography } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { useJwt } from "react-jwt";

const Profile = () => {
  const auth = useAuth();

  let { decodedToken: accessToken } = useJwt(auth.user?.access_token || '');
  let { decodedToken: idToken } = useJwt(auth.user?.id_token || '');

  const handleRefresh = async () => {
    auth.signinSilent();
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">User:</Typography>
      <Button variant="contained" color="primary" onClick={ handleRefresh }>
        Refresh
      </Button>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(auth.user, null, 2)}
      </SyntaxHighlighter>
      <Typography variant="h5">Decoded Access Token:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(accessToken, null, 2)}
      </SyntaxHighlighter>
      <Typography variant="h5">Access Token:</Typography>
      <SyntaxHighlighter style={dracula}>{auth.user?.access_token ?? ''}</SyntaxHighlighter>
      <Typography variant="h5">Decoded ID Token:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(idToken, null, 2)}
      </SyntaxHighlighter>
      <Typography variant="h5">ID Token:</Typography>
      <SyntaxHighlighter style={dracula}>{auth.user?.id_token ?? ''}</SyntaxHighlighter>
    </Stack>
  );
};

export default Profile;
