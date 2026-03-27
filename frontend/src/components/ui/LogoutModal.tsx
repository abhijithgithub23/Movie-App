import { useState } from "react";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { logout } from "../../features/auth/authSlice";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // 1. Tell the backend to clear the HTTP-Only refresh token cookie
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Backend logout failed, but clearing local state anyway.", error);
    } finally {
      // 2. Clear the Redux store (removes user data and access token)
      dispatch(logout());
      
      // 3. Show a nice toast notification
      toast.success("Logged out successfully");
      
      // 4. Close the modal and redirect to the home page
      onClose();
      navigate("/");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-text-muted/20 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
          <LogOut size={32} className="text-red-500" />
        </div>

        <h3 className="text-2xl font-bold text-text-main mb-2">
          {t("readyToLeave")}
        </h3>

        <p className="text-text-muted mb-8 text-sm">
          {t("logoutConfirm")}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 bg-text-muted/20 hover:bg-text-muted/30 text-text-main rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex justify-center items-center"
          >
            {isLoggingOut ? "Logging out..." : t("logOut")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;