import { useTranslation } from "react-i18next";
import { Shield, User as UserIcon, Mail, LogOut, Edit2, X, Check, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { updateProfileAsync } from "../features/auth/authSlice";
import LogoutModal from "../components/ui/LogoutModal";
import apiClient from "../api/apiClient";
import axios from "axios";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const ProfilePage = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAuthenticated, status } = useSelector((state: RootState) => state.auth);
  const isLoading = status === 'loading';

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    profile_pic: "",
  });

  // Populate form when entering edit mode
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        profile_pic: user.profile_pic || "",
      });
    }
  }, [user, isEditing]);

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

  const isAdmin = user.is_admin === true;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION: Strict image check
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Image is too large. Please select an image under 5MB.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      // Reusing our secure Cloudinary endpoint!
      const response = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({ ...prev, profile_pic: response.data.url }));
      toast.success('Picture uploaded successfully!', { id: toastId });
      
    } catch (error: unknown) {
      console.error('Upload Error:', error);
      let errorMessage = 'Failed to upload image.';
      if (axios.isAxiosError(error)) errorMessage = error.response?.data?.message || errorMessage;
      else if (error instanceof Error) errorMessage = error.message;
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  const handleSave = async () => {
    const trimmedUsername = formData.username.trim();
    const trimmedPicUrl = formData.profile_pic.trim();

    // VALIDATION: Username empty check
    if (!trimmedUsername) {
      toast.error("Username cannot be empty");
      return;
    }

    // VALIDATION: URL format check
    if (trimmedPicUrl) {
      try {
        new URL(trimmedPicUrl);
      } catch {
        toast.error("Profile picture URL is invalid.");
        return;
      }
    }

    setIsSaving(true);
    try {
      await dispatch(updateProfileAsync({
        id: user.id,
        username: trimmedUsername,
        profile_pic: trimmedPicUrl || null
      })).unwrap();
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Update Error:", error);
      toast.error(typeof error === 'string' ? error : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-32 pb-12 px-6 md:px-12 flex justify-center items-start bg-body-bg transition-colors duration-300">
        <div className="w-full max-w-2xl bg-text-main/5 backdrop-blur-xl border border-text-main/10 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center justify-between border-b border-text-muted/20 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-text-main tracking-tight">
              {t("profile")}
            </h1>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-btn-bg/10 text-btn-bg font-semibold hover:bg-btn-bg hover:text-btn-text transition-all duration-300"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)}
                disabled={isSaving || isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-text-muted/20 text-text-main font-semibold hover:bg-text-muted/40 transition-all duration-300 disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-text-main/10 shadow-xl bg-text-main/5 flex items-center justify-center text-text-main relative">
                
                <img
                  src={isEditing ? (formData.profile_pic || DEFAULT_AVATAR) : (user.profile_pic || DEFAULT_AVATAR)}
                  alt="Profile"
                  className={`w-full h-full object-cover bg-text-main/10 transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />

                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <UploadCloud size={24} className="mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploading || isSaving}
                      onChange={handleFileUpload} 
                    />
                  </label>
                )}

              </div>
              
              {/* Admin Badge */}
              {isAdmin && !isEditing && (
                <div className="absolute bottom-1 right-1 bg-green-500 p-2.5 rounded-full shadow-lg border-4 border-body-bg" title="Admin Privileges Active">
                  <Shield size={20} className="text-white fill-current" />
                </div>
              )}
            </div>

            {/* User Details Section */}
            <div className="flex-1 space-y-6 text-center md:text-left w-full">
              
              {!isEditing ? (
                // --- VIEW MODE ---
                <>
                  <div>
                    <h2 className="text-3xl font-extrabold text-text-main mb-2">
                      {user.username}
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
                      <span className="text-[15px] font-medium truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted bg-text-main/5 p-3 rounded-xl border border-text-main/5">
                      <UserIcon size={20} className="text-text-main/60" />
                      <span className="text-[15px] font-medium truncate">{user.username}</span>
                    </div>
                  </div>
                </>
              ) : (
                // --- EDIT MODE ---
                <div className="space-y-4 text-left w-full">
                  <div>
                    <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <UserIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-text-main/5 border border-text-main/20 text-text-main rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-btn-bg transition-all"
                        placeholder="Enter your username"
                        disabled={isSaving || isUploading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Email Address (Read Only)</label>
                    <div className="relative opacity-60 cursor-not-allowed">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-text-main/5 border border-text-main/20 text-text-muted rounded-xl pl-10 pr-4 py-3 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isUploading}
                      className="w-full flex items-center justify-center gap-2 bg-btn-bg text-btn-text hover:opacity-90 px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-btn-bg/30"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-btn-text/30 border-t-btn-text rounded-full animate-spin"></div>
                      ) : (
                        <><Check size={18} /> Save Changes</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Logout Button (Only show in view mode) */}
              {!isEditing && (
                <div className="pt-6 border-t border-text-muted/10 flex justify-center md:justify-start">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl font-semibold transition-colors w-full md:w-auto"
                  >
                    <LogOut size={18} />
                    {t("logout")}
                  </button>
                </div>
              )}
              
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