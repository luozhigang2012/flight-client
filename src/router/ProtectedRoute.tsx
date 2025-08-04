import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // 在认证状态加载完成之前，不进行任何重定向，可以显示一个加载指示器
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    // 如果用户未认证，则重定向到登录页
    // 我们还将用户原始意图访问的路径保存在 state 中，
    // 这样登录成功后就可以将他们重定向回去了。
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
