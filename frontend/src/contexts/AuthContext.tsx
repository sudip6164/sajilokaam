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
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken?: string): Promise<boolean> => {
    try {
      const tokenToUse = authToken || token;
      if (!tokenToUse) {
        setIsLoading(false);
        return false;
      }

      const userData = await authApi.getMe();
      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        roles: userData.roles,
      });
      return true;
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem("jwt_token");
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const newToken = response.token;
      
      localStorage.setItem("jwt_token", newToken);
      setToken(newToken);
      
      // Fetch user profile - only show success if this succeeds
      const profileLoaded = await fetchUserProfile(newToken);
      
      if (profileLoaded) {
        toast.success("Login successful!");
      } else {
        throw new Error("Failed to load user profile");
      }
    } catch (error: any) {
      // Clear token if login or profile fetch failed
      localStorage.removeItem("jwt_token");
      setToken(null);
      setUser(null);
      
      const message = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, role?: "CLIENT" | "FREELANCER") => {
    try {
      const response = await authApi.register(email, password, fullName, role);
      const newToken = response.token;
      
      localStorage.setItem("jwt_token", newToken);
      setToken(newToken);
      
      // Fetch user profile
      await fetchUserProfile(newToken);
      
      toast.success("Registration successful!");
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 409) {
        const message = "This email is already registered. Please use a different email or try logging in.";
        toast.error(message);
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Invalid registration data. Please check your information.";
        toast.error(message);
      } else {
        const message = error.response?.data?.message || error.message || "Registration failed. Please try again.";
        toast.error(message);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
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

