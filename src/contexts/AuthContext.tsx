import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(
        "/api/admin/login",
        { email, password },
        { withCredentials: true }
      );

      setUser(response.data.user);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const changeLoading = (boo: boolean) => {
    setIsAuthenticated(boo);
  };

  const userSet = (data: User | null) => {
    setUser(data);
  };

  const changeAuthentication = (boo: boolean) => {
    setIsLoading(boo);
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
