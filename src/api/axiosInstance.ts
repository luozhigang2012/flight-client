// src/api/axiosInstance.ts
import Axios, { type AxiosRequestConfig } from "axios";

// 从环境变量或配置文件中获取 API 的 base URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const AXIOS_INSTANCE = Axios.create({ baseURL: API_URL });

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
