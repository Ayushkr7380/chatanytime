import { FaUserCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMakeAdmin } from "@/hooks/useMakeAdmin";
import { useRemoveMember } from "@/hooks/useRemoveMember";
import { useBlockUser } from "@/hooks/useBlockUser";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import { useUnblockUser } from "@/hooks/useUnblockUser";
import { MessageSquare, Shield, UserMinus, Ban, Loader2 } from "lucide-react";
export default function MemberInfoSheet({
    open,
    onOpenChange,
    member,
    isAdmin,
    currentUserId,
    chatId,
}) {
    const navigate = useNavigate();
    const { data: chats = [] } = useChats();

    const { mutate: makeAdmin, isPending: makingAdmin } = useMakeAdmin();
    const { mutate: removeMember, isPending: removingMember } = useRemoveMember();
    const { mutate: blockUser, isPending: blocking } = useBlockUser();

    const { data: blockStatus } = useBlockStatus(member?._id);
    const { mutate: unblockUser, isPending: unblocking } = useUnblockUser();

    if (!open || !member) return null;

    const handleMessage = () => {
        const existingChat = chats.find(chat =>
            !chat.isGroupChat &&
            chat.users.some(u => u._id === member._id)
        );
        onOpenChange(false);
        if (existingChat) {
            navigate(`/chat/${existingChat._id}`);
        } else {
            navigate(`/new-chat/${member._id}`);
        }
    };

    const handleMakeAdmin = () => {
        makeAdmin({ chatId, userId: member._id }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const handleRemove = () => {
        removeMember({ chatId, userId: member._id }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const handleBlock = () => {
        blockUser(member._id, {
            onSuccess: () => onOpenChange(false)
        });
    };

    // Array objects updated with dynamic icon component handling
    const actions = [
        {
            label: "Message",
            icon: <MessageSquare size={16} className="text-violet-600" />,
            bg: "bg-violet-100",
            color: "text-slate-700 font-medium",
            onClick: handleMessage,
            show: true,
            loading: false,
        },
        {
            label: makingAdmin ? "Updating..." : "Make admin",
            icon: <Shield size={16} className="text-violet-600" />,
            bg: "bg-violet-100",
            color: "text-slate-700 font-medium",
            onClick: handleMakeAdmin,
            show: isAdmin && member._id !== currentUserId,
            loading: makingAdmin,
        },
        {
            label: removingMember ? "Removing..." : "Remove from group",
            icon: <UserMinus size={16} className="text-red-500" />,
            bg: "bg-red-100",
            color: "text-red-500 font-medium",
            onClick: handleRemove,
            show: isAdmin && member._id !== currentUserId,
            loading: removingMember,
        },
        {
            label: blocking ? "Blocking..." : "Block user",
            icon: <Ban size={16} className="text-orange-600" />,
            bg: "bg-orange-100",
            color: "text-slate-700 font-medium",
            onClick: handleBlock,
            show:
                member._id !== currentUserId &&
                !blockStatus?.isBlockedByMe,
            loading: blocking,
        },
        {
            label: unblocking ? "Unblocking..." : "Unblock user",
            icon: <Ban size={16} className="text-green-600" />,
            bg: "bg-green-100",
            color: "text-slate-700 font-medium",
            onClick: () =>
                unblockUser(member._id, {
                    onSuccess: () => onOpenChange(false)
                }),
            show:
                member._id !== currentUserId &&
                blockStatus?.isBlockedByMe,
            loading: unblocking,
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Bottom sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-t-2xl pb-8 overflow-hidden border border-slate-100 shadow-xl animate-in slide-in-from-bottom duration-200">

                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="h-1 w-10 bg-slate-200 rounded-full" />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-3 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <IoClose size={18} className="text-slate-500" />
                    </button>

                    {/* User info */}
                    <div className="flex flex-col items-center py-4 px-4 border-b border-slate-100">
                        {member?.privacy?.profilePic && member?.profilePic ? (
                            <img
                                src={member.profilePic}
                                alt={member.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-violet-200 mb-3"
                            />
                        ) : (
                            <FaUserCircle className="text-7xl text-violet-400 mb-3" />
                        )}
                        <p className="font-semibold text-slate-800 text-base">{member?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">@{member?.username}</p>
                        {member?.privacy?.bio !== false && member?.bio && (
                            <p className="text-xs text-slate-500 mt-1 text-center px-6">{member.bio}</p>
                        )}
                    </div>

                    {/* Actions Links Render */}
                    <div className="px-4 pt-3 space-y-1">
                        {actions.filter(a => a.show).map((action) => (
                            <button
                                key={action.label}
                                onClick={action.onClick}
                                disabled={action.loading}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60`}
                            >
                                <div className={`h-8 w-8 rounded-full ${action.bg} flex items-center justify-center text-sm shrink-0 shadow-sm`}>
                                    {action.loading ? (
                                        <Loader2 size={14} className="animate-spin text-slate-600" />
                                    ) : (
                                        action.icon
                                    )}
                                </div>
                                <span className={`text-sm ${action.color}`}>{action.label}</span>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}