// src/api/axiosInstance.ts
import Axios, { type AxiosRequestConfig } from "axios";

// 从环境变量或配置文件中获取 API 的 base URL
const API_URL = "http://localhost:8080";

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

  const promise: CancellablePromise<ApiResponse<T>> = AXIOS_INSTANCE({
    ...config,
    signal: controller.signal,
  }).then(({ data }) => data);

  promise.cancel = () => {
    controller.abort("Query was cancelled by user");
  };

  return promise;
};

export default axiosInstance;
