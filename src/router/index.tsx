import { createBrowserRouter, useRouteError } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SearchResultPage from "../pages/SearchResultPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import BookingReviewPage from "../pages/BookingReviewPage";
import FlightDetailPage from "../pages/FlightDetailPage";

/**
 * 全局错误边界页面
 * 当路由加载或渲染发生错误时，将显示此 UI。
 */
function ErrorPage() {
  const error = useRouteError() as any;
  console.error("路由错误:", error);

  return (
    <div
      id="error-page"
      className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4"
    >
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-800 mb-2">
        抱歉，应用发生了一个意外错误。
      </p>
      <p className="text-md text-gray-600 bg-red-100 p-2 rounded">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

/**
 * 应用的路由配置
 * 使用 createBrowserRouter 定义了所有页面路由和根布局。
 * App 组件作为根布局，包含了所有子页面。
 * errorElement 提供了全局的错误处理机制。
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "flights/search",
        element: <SearchResultPage />,
      },
      {
        path: "flights/:id",
        element: <FlightDetailPage />,
      },
      {
        path: "bookings",
        element: <MyBookingsPage />,
      },
      {
        path: "booking/review",
        element: <BookingReviewPage />,
      },
    ],
  },
]);
