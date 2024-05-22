import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";
import { buildSignInArgs } from "../utils";

export const Login = () => {
  const { signinRedirect, isLoading } = useAuth();
  const search = useLocation().search;

  if (isLoading) {
    return <></>;
  }
  signinRedirect(buildSignInArgs((new URLSearchParams(search)).get("teamId") ?? ''));

  return <></>;
};

export default Login;
