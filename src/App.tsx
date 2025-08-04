import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { ModalProvider } from "./context/ModalContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <ModalProvider>
          <Navbar />
          <main>
            <Outlet /> {/* 子路由的页面内容将在这里渲染 */}
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <LoginModal />
        </ModalProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
