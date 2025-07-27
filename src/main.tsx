import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App";
import { StagewiseToolbar } from "@stagewise/toolbar-react";

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

// Render the main app
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
      {/* Stagewise Toolbar for debugging */}
      <StagewiseToolbar />
    </QueryClientProvider>
  </StrictMode>
);
