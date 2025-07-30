import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogin } from "../api/auth-controller/auth-controller";
import type {
  LoginRequestDTO,
  UserInfoDTO,
  AuthResponseDTO,
} from "../api/openAPIDefinition.schemas";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

const LoginModal: React.FC = () => {
  const { isModalOpen, hideModal, onLoginSuccess } = useModal();
  const { login } = useAuth();
  const navigate = useNavigate();
  const mutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequestDTO>();

  const onSubmit: SubmitHandler<LoginRequestDTO> = async (formData) => {
    try {
      const response = await mutation.mutateAsync({ data: formData });

      if (response.success && response.data) {
        const responseData = response.data as AuthResponseDTO;
        const { accessToken, userInfo } = responseData;

        if (accessToken && userInfo) {
          toast.success("Login successful!");
          login(accessToken, userInfo as UserInfoDTO);
          hideModal();
          if (onLoginSuccess) {
            onLoginSuccess();
            return; // 执行回调后，终止函数，避免执行下面的默认导航
          }
          // 默认行为：如果没有提供回调，则导航到首页
          navigate("/");
        } else {
          toast.error(response.message || "Incomplete data received.");
        }
      } else {
        toast.error(response.message || "Login failed.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    }
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Log in</h2>
          <button
            onClick={hideModal}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="modal-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="modal-email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="modal-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="modal-password"
              type="password"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {mutation.isPending ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
