import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useLogin } from "../api/auth-controller/auth-controller";
import type {
  LoginRequestDTO,
  UserInfoDTO,
  AuthResponseDTO,
} from "../api/openAPIDefinition.schemas";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {t("Welcome back")}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t("Username or email")}
            </label>
            <input
              id="email"
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
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t("Password")}
            </label>
            <input
              id="password"
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

          <div className="text-sm text-right">
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t("Forgot username or password?")}
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {mutation.isPending ? t("Logging in...") : t("Log in")}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">
              {t("Don't have an account?")}{" "}
            </span>
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t("Sign up")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
