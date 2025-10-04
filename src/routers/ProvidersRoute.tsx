import { AuthProvider } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";

export function ProvidersRoute() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
