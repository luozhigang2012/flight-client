import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { UserInfoDTO } from "../api/openAPIDefinition.schemas";
import { check } from "../api/auth-controller/auth-controller";

// 定义 AuthContext 的数据结构
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfoDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserInfoDTO) => void;
  logout: () => void;
}

// 创建 AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 创建 AuthProvider 组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfoDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  }, []);

  // 在组件加载时，验证本地 token 的有效性
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("userInfo");

      if (storedToken && storedUser) {
        try {
          // 先设置 token，以便 check API 可以携带认证头
          setToken(storedToken);
          const response = await check();
          if (response.success && response.data) {
            // Token 有效，恢复用户信息
            setUser(JSON.parse(storedUser));
          } else {
            // Token 无效，清除所有信息
            logout();
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [logout]);

  const login = (newToken: string, newUser: UserInfoDTO) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("userInfo", JSON.stringify(newUser));
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 创建一个自定义 Hook，方便子组件使用 AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
