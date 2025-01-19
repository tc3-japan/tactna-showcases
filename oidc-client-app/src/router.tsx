import { createElement } from 'react';
import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { WithAuthenticationRequiredProps, withAuthenticationRequired } from "react-oidc-context";

import Layout from './views/Layout';
import Profile from './views/Profile';
import Home from './views/Home';
import Resources from './views/Resources';
import LoadingModal from './components/LoadingModal';
import { Links } from './views/Links';
import { appConfig } from './config';
import Error from './views/Error';
import ErrorChecker from './components/ErrorChecker'; 

const authProps: (path: string) => WithAuthenticationRequiredProps = (path: string) => ({
  OnRedirecting: () => <LoadingModal open={true} />,
  signinRedirectArgs: {
    redirect_uri: window.location.href,
    extraQueryParams: { audience: appConfig.audience },
    state: path,
  },
});

const routes: RouteObject[] = [
  {
    path: '/',
    element: <ErrorChecker />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: 'profile',
            element: createElement(withAuthenticationRequired(Profile, authProps('profile'))), 
          },
          {
            path: 'resources',
            element: createElement(withAuthenticationRequired(Resources, authProps('resources'))), 
          },
          {
            path: 'links',
            element: createElement(withAuthenticationRequired(Links, authProps('links'))),
          }
        ],
      },
      // Error page route
      {
        path: 'error',
        element: <Error />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
