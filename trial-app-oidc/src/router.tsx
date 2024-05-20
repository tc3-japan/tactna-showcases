import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { WithAuthenticationRequiredProps, withAuthenticationRequired } from "react-oidc-context";

import Layout from './views/Layout';
import Profile from './views/Profile';
import Home from './views/Home';
import Resources from './views/Resources';
import LoadingModal from './components/LoadingModal';
import Login from './views/Login';

const props: WithAuthenticationRequiredProps = {
  OnRedirecting: () => <LoadingModal open={true} />,
};

const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: '/',
        Component: Home,
      },
      {
        path: '/profile',
        Component: withAuthenticationRequired(Profile, props),
      },
      {
        path: '/resources',
        Component: withAuthenticationRequired(Resources, props),
      },
      {
        path: '/login',
        Component: Login,
      }
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
