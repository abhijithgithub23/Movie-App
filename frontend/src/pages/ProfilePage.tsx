import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { Shield, User as UserIcon, Mail, Calendar, LogOut } from "lucide-react";
import { useState } from "react";
import LogoutModal from "../components/ui/LogoutModal";

// Default avatar image link
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const ProfilePage = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth0();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-main bg-body-bg">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-text-main/20 border-t-text-main rounded-full animate-spin"></div>
          <p className="font-semibold text-text-muted tracking-widest uppercase text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-main bg-body-bg">
        <p className="text-xl font-medium text-text-muted">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  const isAdmin = user.email === "abhijithksd23@gmail.com";

  return (
    <>
      <div className="min-h-screen pt-32 pb-12 px-6 md:px-12 flex justify-center items-start bg-body-bg">
        <div className="w-full max-w-2xl bg-text-main/5 backdrop-blur-xl border border-text-main/10 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center justify-between border-b border-text-muted/20 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-text-main tracking-tight">
              {t("profile")}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-text-main/10 shadow-xl bg-text-main/5 flex items-center justify-center text-text-main">
                
                <img
                  src={user?.picture || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-full h-full object-cover bg-text-main/10"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />

              </div>
              
              {/* Admin Badge */}
              {isAdmin && (
                <div 
                  className="absolute bottom-1 right-1 bg-green-500 p-2.5 rounded-full shadow-lg border-4 border-body-bg" 
                  title="Admin Privileges Active"
                >
                  <Shield size={20} className="text-white fill-current" />
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-6 text-center md:text-left w-full">
              <div>
                <h2 className="text-3xl font-extrabold text-text-main mb-2">
                  {user.name}
                </h2>

                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider rounded-md border border-green-500/20">
                    <Shield size={14} /> {t("administrator")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider rounded-md border border-blue-500/20">
                    <UserIcon size={14} /> {t("standardUser")}
                  </span>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-text-muted/10 w-full">
                <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted bg-text-main/5 p-3 rounded-xl border border-text-main/5">
                  <Mail size={20} className="text-text-main/60" />
                  <span className="text-[15px] font-medium truncate">
                    {user.email}
                  </span>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted bg-text-main/5 p-3 rounded-xl border border-text-main/5">
                  <UserIcon size={20} className="text-text-main/60" />
                  <span className="text-[15px] font-medium truncate">
                    {user.nickname || user.given_name || "User Alias"}
                  </span>
                </div>

                {user.updated_at && (
                  <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted bg-text-main/5 p-3 rounded-xl border border-text-main/5">
                    <Calendar size={20} className="text-text-main/60" />
                    <span className="text-[15px] font-medium truncate">
                      Last updated: {new Date(user.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-text-muted/10 flex justify-center md:justify-start">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl font-semibold transition-colors w-full md:w-auto"
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
      />
    </>
  );
};

export default ProfilePage;