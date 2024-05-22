import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './views/App.tsx'
import { AuthProvider } from "react-oidc-context";
import { oidcConfig } from './config.tsx';

// import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
