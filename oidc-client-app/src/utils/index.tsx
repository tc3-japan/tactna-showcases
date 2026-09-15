const MESSAGE_ENV_NOT_SET = 'Environment variable setting incorrect.'

export const assert = (value: string | undefined, msg = MESSAGE_ENV_NOT_SET) => {
  if (value == null) throw new Error(msg)
  return value
}

/** Empty when the endpoint is unset or not a URL, which the panel allows. */
export const originOf = (endpoint: string) => {
  try {
    return new URL(endpoint).origin;
  } catch {
    return '';
  }
};

/** MyAccount's signup entry point for this client. Empty when unavailable. */
export const buildSignupUrl = (signupEndpoint: string, clientId: string, redirectUri: string) => {
  try {
    const url = new URL(signupEndpoint);
    url.pathname = '/signup/start';
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    return url.toString();
  } catch {
    return '';
  }
};
