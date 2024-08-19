import { AuthProviderProps } from "react-oidc-context";
import { assert } from './utils'

const authority = assert(import.meta.env.VITE_OIDC_AUTHORITY);
const clientId = assert(import.meta.env.VITE_OIDC_CLIENT_ID);
const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_SIGN_IN || window.location.origin;
const postLogoutRedirectUri = import.meta.env.VITE_OIDC_REDIRECT_SIGN_OUT || window.location.origin;
const signupEndpoint = import.meta.env.VITE_SIGNUP_ENDPOINT;
const postSignupRedirectUri = import.meta.env.VITE_REDIRECT_SIGN_UP;
const resourceServerUri = assert(import.meta.env.VITE_RESOURCE_SERVER_URI);
const audience = import.meta.env.VITE_AUDIENCE;

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  scope: 'openid',
};

export const appConfig = {
  clientId,
  signupEndpoint,
  postSignupRedirectUri: postSignupRedirectUri,
  resourceServerUri,
  audience,
}
