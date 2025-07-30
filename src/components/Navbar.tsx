import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // 登出后跳转到首页
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Skybound Airlines
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t("Book")}
              </Link>
              <Link
                to="/bookings"
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t("Manage")}
              </Link>
            </div>
          </div>
          <div className="ml-4 flex items-center">
            <div className="mr-4">
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={i18n.language === "en" ? "font-bold text-indigo-600" : ""}
              >
                EN
              </button>
              <span className="mx-1">|</span>
              <button
                onClick={() => i18n.changeLanguage("zh")}
                className={i18n.language === "zh" ? "font-bold text-indigo-600" : ""}
              >
                ZH
              </button>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm font-medium">
                  Hi, {user?.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t("Log Out")}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t("Log In")}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
