import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSettings } from '../auth/TactnaAuthProvider';
import { ApiFailure, callResourceServer } from '../auth/resourceServer';

/** Calls a resource server with the access token Tactna issued. */
const Resources = () => {
  const auth = useAuth();
  const { resourceServerUri } = useSettings();
  const [foos, setFoos] = useState<unknown>({});
  const [error, setError] = useState<ApiFailure | null>(null);
  const [name, setName] = useState(new URLSearchParams(window.location.search).get('name') || 'world');

  const getResources = useCallback(async () => {
    const result = await callResourceServer<unknown>(
      auth,
      `${resourceServerUri}?name=${encodeURIComponent(name)}`,
    );
    setError(result.ok ? null : result.error);
    if (result.ok) {
      setFoos(result.data);
    }
  }, [auth, name, resourceServerUri]);

  useEffect(() => {
    void getResources();
    // Deliberately not on `getResources`/`auth`: a 401 renews the token inside
    // the call, which produces a new `auth` — refetching on that would spin
    // against a resource server that keeps refusing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, resourceServerUri]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Foos:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(foos)}
      </SyntaxHighlighter>
      {error && (
        <Alert
          severity={error.retriable ? 'warning' : 'error'}
          // A retry only where one can succeed: an unauthenticated or forbidden
          // answer stands until somebody changes the account's access.
          action={
            error.retriable ? (
              <Button size="small" onClick={() => void getResources()}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {error.message}
        </Alert>
      )}
      <TextField value={name} label="Name" onChange={(e) => setName(e.currentTarget.value)} />
      <Button variant="contained" color="primary" onClick={() => void getResources()}>
        Get Resources
      </Button>
    </Stack>
  );
};

export default Resources;
