// src/api/axiosInstance.ts
import Axios, { type AxiosRequestConfig } from "axios";
import i18n from "../i18n";

// 定义运行时配置的类型
interface RuntimeConfig {
  VITE_API_BASE_URL: string;
}

// 声明全局变量
declare global {
  interface Window {
    runtimeConfig: RuntimeConfig;
  }
}

// 根据环境（开发/生产）决定 API_URL
let API_URL;

if (import.meta.env.DEV) {
  // 在开发环境中，总是使用 .env 文件中的 Vite 环境变量
  API_URL = import.meta.env.VITE_API_BASE_URL;
} else {
  // 在生产环境中，使用由 entrypoint.sh 注入的运行时配置
  API_URL = window.runtimeConfig?.VITE_API_BASE_URL;
}

console.log("API_URL=", API_URL);

export const AXIOS_INSTANCE = Axios.create({ baseURL: API_URL });

// 定义不需要认证的公开 API 路径
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  // 航班和机场查询通常是公开的
  "/api/airports",
  "/api/flights",
];

// 添加请求拦截器，用于在每个请求中智能地注入 JWT
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      config.url?.startsWith(path)
    );

    // 如果是受保护的路径并且存在 token，则添加 Authorization 头
    if (token && !isPublicPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 为所有请求添加 lang 参数
    const lang = i18n.language;
    const langMap: { [key: string]: string } = {
      en: "en_US",
      zh: "zh_CN",
    };
    config.params = { ...config.params, lang: langMap[lang] || "en_US" };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器，用于全局处理错误，特别是 401 Unauthorized
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // 如果响应成功，直接返回
    return response;
  },
  (error) => {
    // 检查是否是 401 错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      // 为了确保应用状态完全重置，并强制重新加载认证逻辑，
      // 我们将用户重定向到登录页并刷新页面。
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // 对于其他错误，正常拒绝 Promise
    return Promise.reject(error);
  }
);

// 定义通用的 API 响应结构
// T 是实际的业务数据类型
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// orval or react-query might need a promise with a `cancel` method.
// see: https://tanstack.com/query/v4/docs/react/guides/query-cancellation#cancelling-requests-with-axios
export interface CancellablePromise<T> extends Promise<T> {
  cancel?: () => void;
}

// 这是我们自定义的请求函数
// orval 将会使用这个函数来发起所有请求
// 它接收 Axios 的配置，并返回一个 Promise
// 返回的数据会自动被 Axios 包装在 data 属性中，
// 并且我们期望这个 data 是我们后端定义的 ApiResponse 结构
export const axiosInstance = <T>(
  config: AxiosRequestConfig
): CancellablePromise<ApiResponse<T>> => {
  const controller = new AbortController();

  // 在开发环境中打印请求的完整 URL
  if (import.meta.env.DEV) {
    const fullUrl = new URL(
      config.url || "",
      AXIOS_INSTANCE.defaults.baseURL || ""
    ).toString();
    console.log("请求信息:", {
      url: fullUrl,
      method: config.method?.toUpperCase(),
      params: config.params,
      data: config.data,
    });
  }

  const promise: CancellablePromise<ApiResponse<T>> = AXIOS_INSTANCE({
    ...config,
    signal: controller.signal,
    // 关键：设置 validateStatus 来避免 4xx 状态码被当作错误
    validateStatus: (status) => {
      // 只有真正的网络错误或服务器错误才当作错误
      // 4xx 状态码通常包含有用的业务信息，不应该被当作错误
      return status < 500;
    },
  })
    .then(({ data }) => {
      // 这里的 data 已经是 ApiResponse<T> 的结构
      if (import.meta.env.DEV) {
        console.log("响应结果 (成功):", data);
      }
      return data;
    })
    .catch((error) => {
      // 只有真正的网络错误或服务器错误才会到这里
      if (import.meta.env.DEV) {
        console.error("响应结果 (异常):", error);
      }
      throw error;
    });

  promise.cancel = () => {
    controller.abort("Query was cancelled by user");
  };
  return promise;
};
export default axiosInstance;
