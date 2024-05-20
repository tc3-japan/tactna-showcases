import { AuthProviderProps } from "react-oidc-context";
import { assert } from './utils'

const authority = assert(import.meta.env.VITE_OIDC_AUTHORITY);
const clientId = assert(import.meta.env.VITE_OIDC_CLIENT_ID);
const redirectUri = assert(import.meta.env.VITE_OIDC_REDIRECT_SIGN_IN);
const postLogoutRedirectUri = assert(import.meta.env.VITE_OIDC_REDIRECT_SIGN_OUT);
const signupEndpoint = import.meta.env.VITE_SIGNUP_ENDPOINT;
const postSignupRedirectUri = import.meta.env.VITE_REDIRECT_SIGN_UP;

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  scope: 'openid',
  // fetchRequestCredentials: 'include',
};

export const appConfig = {
  clientId,
  signupEndpoint,
  postSignupRedirectUri: postSignupRedirectUri,
}
