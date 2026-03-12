import { LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const { logout } = useAuth0();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-text-muted/20 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
          <LogOut size={32} className="text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-text-main mb-2">
          Ready to leave?
        </h3>
        <p className="text-text-muted mb-8 text-sm">
          Are you sure you want to log out of your Cinevia account?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-text-muted/20 hover:bg-text-muted/30 text-text-main rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;