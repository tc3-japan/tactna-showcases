import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { appConfig } from '../config';

const Resources = () => {
  const auth = useAuth();
  const query = new URLSearchParams(window.location.search);
  const [foos, setFoos] = useState({});
  const [name, setName] = useState(query.get('name') || 'world');

  const getResouces = () => {
    const bearer = `Bearer ${auth.user?.access_token.toString()}`;
    fetch(`${appConfig.resourceServerUri}?name=${name}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        'Authorization': bearer,
      }
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      response.json().then((data) => {
        setFoos(data);
      });
    }).catch((error) => {
      console.log(error);
    });
  };

  useEffect(() => {
    getResouces();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Foos:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(foos)}
      </SyntaxHighlighter>
      <TextField value={name} label="Name" onChange={(e) => setName(e.currentTarget.value)}/>
      <Button variant="contained" color="primary" onClick={getResouces}>
        Get Resources
      </Button>
    </Stack>
  );
};

export default Resources;
