import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TactnaAuthProvider } from './auth/TactnaAuthProvider.tsx'
import { DevTools } from './devtools/DevTools.tsx'

// The panel lets a tester point this app at another tenant/client at runtime. A
// real integration configures itself from .env and mounts TactnaAuthProvider
// directly — set VITE_CONFIG_PANEL=false to see that shape.
const showConfigPanel = import.meta.env.VITE_CONFIG_PANEL !== 'false';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {showConfigPanel ? (
      <DevTools>
        <App />
      </DevTools>
    ) : (
      <TactnaAuthProvider>
        <App />
      </TactnaAuthProvider>
    )}
  </React.StrictMode>,
)
