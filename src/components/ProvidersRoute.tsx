import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

export function ProvidersRoute() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
