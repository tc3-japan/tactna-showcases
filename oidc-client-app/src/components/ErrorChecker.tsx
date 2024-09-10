import { ReactNode, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

interface ErrorCheckerProps {
  children?: ReactNode;
}

const ErrorChecker = ({ children }: ErrorCheckerProps) => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    if (params.has("error")) {
      navigate(`/error${location.search}`);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (auth.error) {
      navigate("/error");
    }
  }, [auth.error, navigate]);

  return <>{children ? children : <Outlet />}</>;
};

export default ErrorChecker;
