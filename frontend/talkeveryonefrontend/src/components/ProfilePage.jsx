import { useNavigate } from "react-router-dom";
import { useMe } from "@/hooks/useMe";
import { useLogout } from "@/hooks/useLogout";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { TiCamera } from "react-icons/ti";
import { MdEdit } from "react-icons/md";
// import axios from "axios";
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUploadProfilePic } from "@/hooks/useUploadProfilePic";

// const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function ProfilePage() {
    const navigate = useNavigate();
    // const queryClient = useQueryClient();
    const { data: meData } = useMe();
    const user = meData?.user;
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const fileInputRef = useRef(null);

    // editing state
    const [editingField, setEditingField] = useState(null); // 'name' | 'username' | 'bio'
    const [editValue, setEditValue] = useState("");

    // upload pic mutation
    const { mutate: uploadPic, isPending: isUploading } = useUploadProfilePic()

    // update profile mutation
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()

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
            {
                onSuccess: () => setEditingField(null)
            }
        );
    };

    const rows = [
        { label: "Name", field: "name", value: user?.name },
        { label: "Username", field: "username", value: user?.username ? `@${user.username}` : "" },
        { label: "Bio", field: "bio", value: user?.bio || "", placeholder: "Add a bio..." },
    ];

    return (
        <div
            className="w-full flex flex-col bg-slate-50"
            style={{ height: "var(--app-height)" }}
        >
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button
                    onClick={() => navigate("/")}
                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                >
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">Profile</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">

                {/* DP section */}
                <div className="flex flex-col items-center py-6 bg-white border-b border-slate-200">
                    <div className="relative mb-3">
                        <img
                            src={user?.profilePic || dummyprofilepic}
                            alt="profile"
                            className="h-20 w-20 rounded-full object-cover border-2 border-violet-200"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 h-7 w-7 bg-violet-600 rounded-full flex items-center justify-center border-2 border-white"
                        >
                            {isUploading
                                ? <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                                : <TiCamera size={14} className="text-white" />
                            }
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                    {user?.bio && (
                        <p className="text-xs text-slate-400 mt-1 text-center px-8">{user.bio}</p>
                    )}
                </div>

                {/* Editable fields */}
                <div className="bg-white mt-2 border-y border-slate-200">
                    {rows.map(({ label, field, value, placeholder }) => (
                        <div
                            key={field}
                            className="px-5 py-3 border-b border-slate-100 last:border-b-0"
                        >
                            <p className="text-xs text-slate-400 mb-1">{label}</p>

                            {editingField === field ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 text-sm border border-violet-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-100"
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleEditSave();
                                            if (e.key === "Escape") setEditingField(null);
                                        }}
                                    />
                                    <button
                                        onClick={handleEditSave}
                                        disabled={isUpdating}
                                        className="text-xs text-violet-600 font-medium"
                                    >
                                        {isUpdating ? "..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setEditingField(null)}
                                        className="text-xs text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm ${value ? "text-slate-800" : "text-slate-400 italic"}`}>
                                        {value || placeholder || "—"}
                                    </p>
                                    <button onClick={() => handleEditStart(field)}>
                                        <MdEdit size={16} className="text-slate-400 hover:text-violet-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Options */}
                <div className="bg-white mt-2 border-y border-slate-200">

                    {/* My Info */}
                    <button
                        onClick={() => navigate("/profile/info")}
                        className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <FaUserCircle size={16} className="text-violet-600" />
                            </div>
                            <span className="text-sm text-slate-700">My info</span>
                        </div>
                        <span className="text-slate-400 text-xs">›</span>
                    </button>

                    {/* Privacy */}
                    <button
                        onClick={() => navigate("/profile/privacy")}
                        className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <span className="text-violet-600 text-sm">🔒</span>
                            </div>
                            <span className="text-sm text-slate-700">Privacy</span>
                        </div>
                        <span className="text-slate-400 text-xs">›</span>
                    </button>

                    {/* Blocked users */}
                    <button
                        onClick={() => navigate("/profile/blocked")}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-500 text-sm">🚫</span>
                            </div>
                            <span className="text-sm text-slate-700">Blocked users</span>
                        </div>
                        <span className="text-slate-400 text-xs">›</span>
                    </button>

                </div>

                {/* Logout */}
                <div className="px-4 py-4">
                    <button
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>

            </div>
        </div>
    );
}