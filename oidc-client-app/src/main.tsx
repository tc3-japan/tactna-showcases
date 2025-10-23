import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ConfigurationPanel from './components/ConfigurationPanel.tsx'
import { OidcConfigProvider } from './contexts/OidcConfigContext.tsx';
import { DynamicAuthProvider } from './components/DynamicAuthProvider.tsx';

const currUrl = new URL(window.location.href);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OidcConfigProvider initialTeamId={currUrl.searchParams.get("team_id") || ""}>
      <ConfigurationPanel />
      <DynamicAuthProvider>
        <App />
      </DynamicAuthProvider>
    </OidcConfigProvider>
  </React.StrictMode>,
)
