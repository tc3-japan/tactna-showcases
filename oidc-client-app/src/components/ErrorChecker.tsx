import { ReactNode, useEffect, useMemo, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

interface ErrorCheckerProps {
  children?: ReactNode;
}

const ERROR_PATH = "/error";

/** Sends an authorization error — in the URL or in the auth state — to /error. */
const ErrorChecker = ({ children }: ErrorCheckerProps) => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  // Not `auth`: that is a new object on every state change, so an effect
  // depending on it navigates again and again.
  const authError = auth?.error;
  const onErrorPage = location.pathname === ERROR_PATH;
  // The failure already on screen. `auth.error` is never cleared, so without
  // this the user could not leave the error page — every route change would
  // send them straight back to it.
  const shown = useRef<unknown>(null);

  useEffect(() => {
    const failure = authError ?? (params.has("error") ? location.search : null);
    if (!failure) return;
    if (onErrorPage) {
      shown.current = failure;
      return;
    }
    if (shown.current === failure) return;
    shown.current = failure;
    // Keep the response when it is in the URL: the error page reads
    // `error` / `error_description` from it.
    navigate(params.has("error") ? `${ERROR_PATH}${location.search}` : ERROR_PATH, {
      replace: true,
    });
  }, [onErrorPage, authError, params, location.search, navigate]);

  return <>{children ? children : <Outlet />}</>;
};

export default ErrorChecker;
