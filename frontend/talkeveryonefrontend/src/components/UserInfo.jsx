import { FaUserCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import { useBlockUser } from "@/hooks/useBlockUser";
import { useUnblockUser } from "@/hooks/useUnblockUser";
import Skeleton from "@/components/Skeleton";

export default function UserInfo() {

    const navigate = useNavigate();
    const { chatId } = useParams();
    const { data: chats } = useChats();
    const { data: meData } = useMe();
    const chat = chats.find(c => c._id === chatId);
    const otherUser = chat.users.find(u => u._id !== meData?.user?._id);
    const { data: blockStatus } = useBlockStatus(otherUser?._id);
    const { mutate: blockUser, isPending: blocking } = useBlockUser();
    const { mutate: unblockUser, isPending: unblocking } = useUnblockUser();

    if (!chats) {
        return (
            <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex-1 flex flex-col items-center pt-10 gap-3">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        );
    }



    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                User not found
            </div>
        );
    }




    return (
        <div
            className="w-full flex flex-col bg-slate-50"
            style={{ height: "var(--app-height)" }}
        >
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                >
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">Contact info</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">

                {/* DP + name + bio */}
                <div className="bg-white flex flex-col items-center py-6 px-4 border-b border-slate-200">
                    {otherUser?.privacy?.profilePic && otherUser?.profilePic ? (
                        <img
                            src={otherUser.profilePic}
                            alt={otherUser.name}
                            className="h-20 w-20 rounded-full object-cover border-2 border-violet-200 mb-3"
                        />
                    ) : (
                        <FaUserCircle className="text-8xl text-violet-400 mb-3" />
                    )}
                    <p className="font-semibold text-slate-800 text-base">{otherUser?.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">@{otherUser?.username}</p>
                    {otherUser?.privacy?.bio !== false && otherUser?.bio && (
                        <p className="text-xs text-slate-500 mt-2 text-center px-8">{otherUser.bio}</p>
                    )}
                </div>

                {/* Details */}

                <div className="bg-white mt-2 border-y border-slate-200">
                    <button
                        onClick={() => navigate(`/chat/${chatId}`)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-sm">💬</span>
                        </div>
                        <span className="text-sm text-slate-700">Message</span>
                    </button>
                </div>
                
                <div className="bg-white mt-2 border-y border-slate-200">
                    <div className="px-5 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Email</p>
                        <p className="text-sm text-slate-800">{otherUser?.email}</p>
                    </div>
                    <div className="px-5 py-3">
                        <p className="text-xs text-slate-400 mb-1">Username</p>
                        <p className="text-sm text-slate-800">@{otherUser?.username}</p>
                    </div>
                </div>
                
                

                {/* Blocked by them */}
                {blockStatus?.blockedMe && (
                    <div className="mx-4 mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                        <p className="text-xs text-red-500 text-center">
                            This user has blocked you
                        </p>
                    </div>
                )}

                {/* Block / Unblock */}
                <div className="px-4 py-4">
                    {blockStatus?.isBlockedByMe ? (
                        <button
                            onClick={() => unblockUser(otherUser._id)}
                            disabled={unblocking}
                            className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
                        >
                            {unblocking ? "Unblocking..." : "Unblock user"}
                        </button>
                    ) : (
                        <button
                            onClick={() => blockUser(otherUser._id)}
                            disabled={blocking}
                            className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            {blocking ? "Blocking..." : "Block user"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}