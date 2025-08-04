import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./i18n";

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1 * 60 * 1000, // 1分钟内数据保持新鲜
      gcTime: 5 * 60 * 1000, // 缓存保留10分钟
    },
  },
});

// 关键：在生产环境中检查运行时配置
if (
  !import.meta.env.DEV &&
  (!window.runtimeConfig?.VITE_API_BASE_URL ||
    window.runtimeConfig.VITE_API_BASE_URL === "__API_BASE_URL__")
) {
  // 如果配置不正确，重定向到专门的错误页面
  // 使用 replace 避免用户可以通过“后退”按钮回到损坏的页面
  window.location.replace("/config-error");
} else {
  // Render the main app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
        {/* Stagewise Toolbar for debugging */}
        <StagewiseToolbar />
      </QueryClientProvider>
    </StrictMode>
  );
}
