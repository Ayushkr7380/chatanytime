import { useNavigate } from "react-router-dom";
import { useMe } from "@/hooks/useMe";
import { useLogout } from "@/hooks/useLogout";
import { useState, useRef, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Lock, ShieldAlert, Smartphone, ChevronRight, Loader2 } from "lucide-react"; // Imported clean icons
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadProfilePic } from "@/hooks/useUploadProfilePic";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { data: meData } = useMe();
    const user = meData?.user;
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const fileInputRef = useRef(null);
    const dpMenuRef = useRef(null);
    const [dpMenuOpen, setDpMenuOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");

    const { mutate: uploadPic, isPending: isUploadingDP } = useUploadProfilePic();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dpMenuRef.current && !dpMenuRef.current.contains(e.target)) {
                setDpMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) uploadPic(file);
    };

    const handleEditStart = (field) => {
        setEditingField(field);
        setEditValue(user?.[field] || "");
    };

    const handleEditSave = () => {
        if (!editValue.trim()) return;
        updateProfile(
            { [editingField]: editValue.trim() },
            { onSuccess: () => setEditingField(null) }
        );
    };

    const rows = [
        { label: "Name", field: "name", value: user?.name },
        { label: "Username", field: "username", value: user?.username ? `@${user.username}` : "" },
        { label: "Bio", field: "bio", value: user?.bio || "", placeholder: "Add a bio..." },
    ];

    return (
        <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button onClick={() => navigate("/")} className="md:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0">
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">Profile</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">

                {/* Profile Top Section */}
                <div className="flex flex-col items-center py-6 bg-white border-b border-slate-200">
                    <div className="relative mb-3" ref={dpMenuRef}>
                        <img
                            src={user?.profilePic || dummyprofilepic}
                            alt="profile"
                            className="h-20 w-20 rounded-full object-cover border-2 border-violet-200"
                        />
                        <button
                            onClick={() => setDpMenuOpen(prev => !prev)}
                            className="absolute bottom-0 right-0 h-6 w-6 bg-violet-600 rounded-full flex items-center justify-center border-2 border-white transition-transform active:scale-95"
                        >
                            {isUploadingDP || isUpdating ? (
                                <Loader2 className="h-3 w-3 text-white animate-spin" />
                            ) : (
                                <MdEdit size={12} className="text-white" />
                            )}
                        </button>

                        {dpMenuOpen && (
                            <div className="absolute top-22 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[155px]">
                                <button
                                    onClick={() => { fileInputRef.current?.click(); setDpMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-violet-700 hover:bg-violet-50 transition-colors font-medium"
                                >
                                    Change photo
                                </button>
                                <div className="h-px bg-slate-100" />
                                <button
                                    onClick={() => {
                                        updateProfile(
                                            { profilePic: null },
                                            { onSettled: () => setDpMenuOpen(false) }
                                        );
                                    }}
                                    disabled={isUpdating}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                                >
                                    {isUpdating ? "Removing..." : "Remove photo"}
                                </button>
                            </div>
                        )}

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                    {user?.bio && <p className="text-xs text-slate-400 mt-1 text-center px-8">{user.bio}</p>}
                </div>

                {/* Editable Fields */}
                <div className="bg-white mt-2 border-y border-slate-200">
                    {rows.map(({ label, field, value, placeholder }) => (
                        <div key={field} className="px-5 py-3 border-b border-slate-100 last:border-b-0">
                            <p className="text-xs text-slate-400 mb-1">{label}</p>
                            {editingField === field ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 text-sm border border-violet-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleEditSave();
                                            if (e.key === "Escape") setEditingField(null);
                                        }}
                                    />
                                    <button onClick={handleEditSave} disabled={isUpdating} className="text-xs text-violet-600 font-semibold hover:text-violet-700">
                                        {isUpdating ? "..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditingField(null)} className="text-xs text-slate-400 hover:text-slate-500">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm ${value ? "text-slate-800" : "text-slate-400 italic"}`}>
                                        {value || placeholder || "—"}
                                    </p>
                                    <button onClick={() => handleEditStart(field)}>
                                        <MdEdit size={16} className="text-slate-400 hover:text-violet-600 transition-colors" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation Links */}
                <div className="bg-white mt-2 border-y border-slate-200 divide-y divide-slate-100">
                    <button onClick={() => navigate("/profile/info")} className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center">
                                <FaUserCircle size={16} className="text-violet-600" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">My info</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={() => navigate("/profile/privacy")} className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center">
                                <Lock size={14} className="text-violet-600" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Privacy</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={() => navigate("/profile/blocked")} className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                                <ShieldAlert size={15} className="text-red-500" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Blocked users</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={() => navigate("/profile/sessions")} className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center">
                                <Smartphone size={15} className="text-violet-600" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Active sessions</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {/* Logout Button */}
                <div className="px-4 py-4">
                    <button
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>

            </div>
        </div>
    );
}