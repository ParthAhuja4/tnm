import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, User } from "@/contexts/AuthContext";

function PublicRouter() {
  const {
    isAuthenticated,
    changeAuthentication,
    userSet,
    changeLoading,
    isLoading,
  } = useAuth();
  const location = useLocation();

  useEffect(() => {
    changeLoading(true);

    const token = localStorage.getItem("token");

    if (token) {
      const userData: User | null = JSON.parse(
        localStorage.getItem("user") || "null"
      );
      userSet(userData);
      changeAuthentication(true);
    } else {
      userSet(null);
      changeAuthentication(false);
    }

    changeLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (location.pathname === "/") {
    return <Navigate to={isAuthenticated ? "/app" : "/login"} replace />;
  }

  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}

export default PublicRouter;