import React, { createContext, useContext, useState } from "react";

// 定义 ModalContext 的数据结构
interface ModalContextType {
  isModalOpen: boolean;
  showLoginModal: (onSuccess?: () => void) => void;
  hideModal: () => void;
  onLoginSuccess: (() => void) | null;
}

// 创建 ModalContext
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// 创建 ModalProvider 组件
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onLoginSuccess, setOnLoginSuccess] = useState<(() => void) | null>(
    null
  );

  const showLoginModal = (onSuccess?: () => void) => {
    if (onSuccess) {
      setOnLoginSuccess(() => onSuccess);
    }
    setIsModalOpen(true);
  };

  const hideModal = () => {
    setIsModalOpen(false);
    setOnLoginSuccess(null); // 关闭时清空回调
  };

  return (
    <ModalContext.Provider
      value={{ isModalOpen, showLoginModal, hideModal, onLoginSuccess }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// 创建一个自定义 Hook，方便子组件使用 ModalContext
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
