import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserInfoDTO } from "../api/openAPIDefinition.schemas";

// 定义 AuthContext 的数据结构
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfoDTO | null;
  token: string | null;
  isLoading: boolean; // 新增：指示认证状态是否正在加载
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // 初始为 true

  // 在组件加载时，尝试从 localStorage恢复认证状态
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("userInfo");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // 如果解析失败，清除无效数据
        localStorage.removeItem("userInfo");
        localStorage.removeItem("accessToken");
      }
    }
    setIsLoading(false); // 无论是否恢复成功，都将加载状态设置为 false
  }, []);

  const login = (newToken: string, newUser: UserInfoDTO) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("userInfo", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  };

  const isAuthenticated = !!token;

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
