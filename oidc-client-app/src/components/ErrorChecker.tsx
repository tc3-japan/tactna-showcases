import { ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

interface ErrorCheckerProps {
  children?: ReactNode;
}

const ErrorChecker = ({ children }: ErrorCheckerProps) => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    if (params.has("error")) {
      navigate(`/error${location.search}`);
    }
  }, [params, location.search, navigate]);

  useEffect(() => {
    if (auth && auth.error) {
      navigate("/error");
    }
  }, [auth, navigate]);

  return <>{children ? children : <Outlet />}</>;
};

export default ErrorChecker;
