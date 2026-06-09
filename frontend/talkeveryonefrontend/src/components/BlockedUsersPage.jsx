import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useUnblockUser } from "@/hooks/useUnblockUser";
import { useQueryClient } from "@tanstack/react-query";
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import Skeleton from "@/components/Skeleton";
import { useState } from "react";

export default function BlockedUsersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading } = useBlockedUsers();
    const { mutate: unblock } = useUnblockUser();

    const blockedUsers = data?.blockedUsers || [];

    const [unblockingId, setUnblockingId] = useState(null);

    const handleUnblock = (userId) => {
        setUnblockingId(userId);
        unblock(userId, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
                setUnblockingId(null);
            },
            onError: () => setUnblockingId(null)
        });
    };


    return (
        <div
            className="w-full flex flex-col bg-slate-50"
            style={{ height: "var(--app-height)" }}
        >
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button
                    onClick={() => navigate("/profile")}
                    className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                >
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">Blocked users</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">

                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-28 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blockedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <p className="text-2xl mb-2">🚫</p>
                        <p className="font-semibold text-slate-700">No blocked users</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Users you block will appear here
                        </p>
                    </div>
                ) : (
                    <div className="bg-white mt-2 border-y border-slate-200">
                        {blockedUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0"
                            >
                                <img
                                    src={user.profilePic || dummyprofilepic}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        @{user.username}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleUnblock(user._id)}
                                    disabled={unblockingId === user._id}
                                    className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors shrink-0 min-w-[64px] flex items-center justify-center"
                                >
                                    {unblockingId === user._id ? (
                                        <div className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "Unblock"
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}