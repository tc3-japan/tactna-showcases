import { SigninRedirectArgs } from "oidc-client-ts";

const MESSAGE_ENV_NOT_SET = 'Environment variable setting incorrect.'

export const assert = (value: any, msg = MESSAGE_ENV_NOT_SET) => {
  if (value == null) throw new Error(msg)
  return value
}

export const buildSignInArgs = (teamId?: string, aud?: string): SigninRedirectArgs => {
  const extraQueryParams: { teamId?: string; aud?: string } = {}; // Declare the type of extraQueryParams
  if (teamId) {
    extraQueryParams.teamId = teamId;
  }
  if (aud) {
    extraQueryParams.aud = aud;
  }
  return {
    extraQueryParams,
  };
};
