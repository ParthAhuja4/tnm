import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { initializeCampaignData } from "@/services/campaignData";
export type User = {
  id: string | number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  changeAuthentication: (boo: boolean) => void;
  changeLoading: (boo: boolean) => void;
  userSet: (data: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string, role: string) => {
    let obj: User | null = null;

    try {
      const response = await api.post(
        `/api/${role}/login`,
        { email, password },
        { withCredentials: true }
      );

      if (role === "admin") {
        const { id, name, email, role } = response.data.user;
        obj = { id, name, email, role };
      } else {
        const { client_id, client_name, email, role } = response.data.user;
        obj = { id: client_id, name: client_name, email, role };
      }

      // Move this OUTSIDE the role-specific blocks but INSIDE try block
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(obj));
      setUser(obj);
      setIsAuthenticated(true);
      setIsLoading(false);

      if (role === "client" && obj) {
        const clientId = String(
          JSON.parse(localStorage.getItem("user") || "null").id
        );
        console.log("Passing clientId:", clientId); // Debug log
        initializeCampaignData(clientId).catch(console.error);
      }

      navigate("/app/dashboard");
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const changeLoading = (boo: boolean) => {
    setIsLoading(boo);
  };

  const userSet = (data: User | null) => {
    setUser(data);
  };

  const changeAuthentication = (boo: boolean) => {
    setIsAuthenticated(boo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
        changeAuthentication,
        userSet,
        changeLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
