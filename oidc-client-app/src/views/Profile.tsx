import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Stack, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
      <Button variant="contained" color="primary" onClick={ handleRefresh }>
        Refresh Token
      </Button>
      <Typography variant="h5">Access Token:</Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <SyntaxHighlighter style={dracula}>{auth.user?.access_token ?? ''}</SyntaxHighlighter>
        <IconButton onClick={() => navigator.clipboard.writeText(auth.user?.access_token ?? '')}>
          <ContentCopyIcon />
        </IconButton>
      </Stack>
      <Typography variant="h5">Decoded Access Token:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(accessToken, null, 2)}
      </SyntaxHighlighter>
      <Typography variant="h5">ID Token:</Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
      <SyntaxHighlighter style={dracula}>{auth.user?.id_token ?? ''}</SyntaxHighlighter>
        <IconButton onClick={() => navigator.clipboard.writeText(auth.user?.id_token ?? '')}>
          <ContentCopyIcon />
        </IconButton>
      </Stack>
      <Typography variant="h5">Decoded ID Token:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(idToken, null, 2)}
      </SyntaxHighlighter>
    </Stack>
  );
};

export default Profile;
