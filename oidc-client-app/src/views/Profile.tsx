import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Stack, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from 'react-oidc-context';
import { useJwt } from "react-jwt";
import { readCustomClaims, readTactnaClaims } from '../auth/claims';

const Profile = () => {
  const auth = useAuth();
  const claims = readTactnaClaims(auth.user);
  const customClaims = readCustomClaims(auth.user);

  const { decodedToken: accessToken } = useJwt(auth.user?.access_token || '');
  const { decodedToken: idToken } = useJwt(auth.user?.id_token || '');

  return (
    <Stack spacing={2}>
      <Button variant="contained" color="primary" onClick={() => void auth.signinSilent()}>
        Refresh Token
      </Button>

      <Typography variant="h5">Tactna claims:</Typography>
      {claims ? (
        <Stack spacing={1}>
          <SyntaxHighlighter language="json" style={dracula}>
            {JSON.stringify({ ...claims, custom: customClaims }, null, 2)}
          </SyntaxHighlighter>
        </Stack>
      ) : (
        <Typography>No Tactna claims on this token.</Typography>
      )}

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
