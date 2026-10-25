
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/authApi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
  status: string;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const { isPending } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response.data.user as AuthUser,
    // Existing login flow sets the user directly.
    // This query verifies the session when the app initializes.
  });

  const query = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Restore user from the API when the session query succeeds.
  const currentUser = query.data?.data?.user as AuthUser | undefined;

  if (currentUser && user?.id !== currentUser.id) {
    setUser(currentUser);
  }

  const isLoading = isPending;

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
