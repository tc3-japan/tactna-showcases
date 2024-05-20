import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useAuth } from 'react-oidc-context';

const Resources = () => {
  const auth = useAuth();
  const [foos, setFoos] = useState({});

  const getResouces = () => {
    const bearer = `Bearer ${auth.user?.access_token.toString()}`;
    fetch('https://jtutvacfl1.execute-api.ap-northeast-1.amazonaws.com/Demo?name=tactna', {
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

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Foos:</Typography>
      <SyntaxHighlighter language="json" style={dracula}>
        {JSON.stringify(foos)}
      </SyntaxHighlighter>
      <Button variant="contained" color="primary" onClick={getResouces}>
        Get Resources
      </Button>
    </Stack>
  );
};

export default Resources;
