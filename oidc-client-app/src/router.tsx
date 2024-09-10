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

const props: WithAuthenticationRequiredProps = {
  OnRedirecting: () => <LoadingModal open={true} />,
  signinRedirectArgs: {
    redirect_uri: window.location.href,
    extraQueryParams: { audience: appConfig.audience },
  },
};

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
            element: createElement(withAuthenticationRequired(Profile, props)), 
          },
          {
            path: 'resources',
            element: createElement(withAuthenticationRequired(Resources, props)), 
          },
          {
            path: 'links',
            element: createElement(withAuthenticationRequired(Links, props)),
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