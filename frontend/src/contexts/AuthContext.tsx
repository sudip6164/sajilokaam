import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/lib/api";
import { User, AuthContextType } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken?: string) => {
    try {
      const tokenToUse = authToken || token;
      if (!tokenToUse) {
        setIsLoading(false);
        return;
      }

      const userData = await authApi.getMe();
      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        roles: userData.roles,
      });
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const newToken = response.token;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      
      // Fetch user profile
      await fetchUserProfile(newToken);
      
      toast.success("Login successful!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, role?: "CLIENT" | "FREELANCER") => {
    try {
      const response = await authApi.register(email, password, fullName, role);
      const newToken = response.token;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);
      
      // Fetch user profile
      await fetchUserProfile(newToken);
      
      toast.success("Registration successful!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile();
    }
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some((role) => role.name === roleName.toUpperCase());
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

