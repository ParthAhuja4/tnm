import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { AxiosError } from "axios";
import { storage } from "./storage-utils";
import { ApiError } from "./api-utils";
import { api } from "../services/api";

// Storage keys
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

// Token expiration buffer (5 minutes)
const TOKEN_EXPIRATION_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

// User data interface
export interface UserData {
  id: number | string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  permissions?: string[];
  [key: string]: any;
}

// Auth tokens interface
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Get access token
export function getAccessToken(): string | null {
  return storage.get<string>(AUTH_TOKEN_KEY);
}

// Get refresh token
export function getRefreshToken(): string | null {
  return storage.get<string>(REFRESH_TOKEN_KEY);
}

// Get user data
export function getUserData(): UserData | null {
  return storage.get<UserData>(USER_DATA_KEY);
}

// Set auth tokens
function setAuthTokens(tokens: AuthTokens): void {
  const { accessToken, refreshToken, expiresIn } = tokens;

  // Calculate expiration time
  const expiresAt = expiresIn
    ? Date.now() + expiresIn * 1000 - TOKEN_EXPIRATION_BUFFER
    : undefined;

  storage.set(AUTH_TOKEN_KEY, accessToken, { expiresAt });

  if (refreshToken) {
    storage.set(REFRESH_TOKEN_KEY, refreshToken, {
      // Refresh token typically has a longer expiration
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  // Set up axios auth header
  if (api) {
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }
}

// Set user data
function setUserData(userData: UserData): void {
  storage.set(USER_DATA_KEY, userData);
}

// Login
export async function login(credentials: {
  email: string;
  password: string;
}): Promise<UserData> {
  try {
    // Replace with your actual login API call
    const response = await api.post("/auth/login", credentials);
    const { user, access_token, refresh_token, expires_in } = response.data;

    // Store tokens and user data
    setAuthTokens({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    });

    setUserData(user);

    return user;
  } catch (error) {
    throw new ApiError(error as AxiosError);
  }
}

// Logout
export function logout(): void {
  // Clear storage
  storage.remove(AUTH_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
  storage.remove(USER_DATA_KEY);

  // Clear axios auth header
  if (api) {
    delete api.defaults.headers.common["Authorization"];
  }

  // Redirect to login or home page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Register
export async function register(userData: {
  name: string;
  email: string;
  password: string;
  [key: string]: any;
}): Promise<UserData> {
  try {
    // Replace with your actual register API call
    const response = await api.post("/auth/register", userData);
    const { user, access_token, refresh_token, expires_in } = response.data;

    // Store tokens and user data
    setAuthTokens({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    });

    setUserData(user);

    return user;
  } catch (error) {
    throw new ApiError(error as AxiosError);
  }
}

// Forgot password
export async function forgotPassword(email: string): Promise<void> {
  try {
    await api.post("/auth/forgot-password", { email });
  } catch (error) {
    throw new ApiError(error as AxiosError);
  }
}

// Reset password
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  try {
    await api.post("/auth/reset-password", { token, password });
  } catch (error) {
    throw new ApiError(error as AxiosError);
  }
}

// Refresh access token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await api.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token, expires_in } = response.data;

    setAuthTokens({
      accessToken: access_token,
      refreshToken: refresh_token || refreshToken, // Use new refresh token if provided
      expiresIn: expires_in,
    });

    return access_token;
  } catch (error) {
    // If refresh fails, logout the user
    logout();
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    return null;
  }
}

// Get token payload
export function getTokenPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    return null;
  }
}

// Check if user has permission
export function hasPermission(permission: string | string[]): boolean {
  const user = getUserData();

  if (!user) {
    return false;
  }

  // If user has all permissions
  if (user.permissions?.includes("*")) {
    return true;
  }

  // Check for specific permissions
  const permissionsToCheck = Array.isArray(permission)
    ? permission
    : [permission];
  return permissionsToCheck.every((perm) => user.permissions?.includes(perm));
}

// Check if user has any of the permissions
export function hasAnyPermission(permissions: string[]): boolean {
  const user = getUserData();

  if (!user) {
    return false;
  }

  // If user has all permissions
  if (user.permissions?.includes("*")) {
    return true;
  }

  // Check for any of the permissions
  return permissions.some((perm) => user.permissions?.includes(perm));
}

// Check if user has role
export function hasRole(role: string | string[]): boolean {
  const user = getUserData();

  if (!user) {
    return false;
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];
  return rolesToCheck.includes(user.role);
}

// Check if user has any of the roles
export function hasAnyRole(roles: string[]): boolean {
  const user = getUserData();
  return user ? roles.includes(user.role) : false;
}

// Update user data
export function updateUserData(userData: Partial<UserData>): void {
  const currentUser = getUserData();

  if (currentUser) {
    setUserData({ ...currentUser, ...userData });
  }
}

// Initialize auth state
export function initializeAuth(): void {
  const token = getAccessToken();

  if (token) {
    // Set axios auth header
    if (api) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Try to refresh token
      refreshAccessToken().catch(() => {
        // If refresh fails, logout the user
        logout();
      });
    }
  }
}

// Auth provider props
type AuthProviderProps = {
  children: React.ReactNode;
  onLogin?: (user: UserData) => void;
  onLogout?: () => void;
};

// Auth context type
type AuthContextType = {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<UserData>;
  register: (userData: any) => Promise<UserData>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
  hasPermission: (permission: string | string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({
  children,
  onLogin,
  onLogout,
}: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(getUserData());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
    setIsInitialized(true);

    // Set up storage listener for auth changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === USER_DATA_KEY) {
        setUser(getUserData());
      } else if (event.key === AUTH_TOKEN_KEY && !event.newValue) {
        // Token was removed (logout)
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle login
  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    const userData = await login(credentials);
    setUser(userData);

    if (onLogin) {
      onLogin(userData);
    }

    return userData;
  };

  // Handle register
  const handleRegister = async (userData: any) => {
    const userDataResponse = await register(userData);
    setUser(userDataResponse);

    if (onLogin) {
      onLogin(userDataResponse);
    }

    return userDataResponse;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);

    if (onLogout) {
      onLogout();
    }
  };

  // Handle user update
  const handleUpdateUser = (userData: Partial<UserData>) => {
    updateUserData(userData);
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      forgotPassword,
      resetPassword,
      updateUser: handleUpdateUser,
      hasPermission,
      hasAnyPermission,
      hasRole,
      hasAnyRole,
    }),
    [user]
  );

  // Show loading state until auth is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
