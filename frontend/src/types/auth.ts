export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: "CLIENT" | "FREELANCER") => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

