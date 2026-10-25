import {
  createContext,
  useContext,
  useEffect,
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

  const {
    data: currentUser,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.user as AuthUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (isError) {
      setUser(null);
    }
  }, [currentUser, isError]);

  const isLoading =
    isPending || (!!currentUser && user?.id !== currentUser.id);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
      }}
    >
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