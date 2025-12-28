import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

type UserRole = "admin" | "freelancer" | "client" | null;

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

// Simulated auth state - in production, this would come from a context/state management
const useAuth = () => {
  // This is a placeholder. In a real app, this would check actual authentication state
  const isAuthenticated = true; // Change to test different states
  const userRole: UserRole = "freelancer"; // Change to test different roles

  return { isAuthenticated, userRole };
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to access denied page
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
