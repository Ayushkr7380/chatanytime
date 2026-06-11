import { useState } from "react";
import { IoArrowBack, IoAdd } from "react-icons/io5";
import { FaUserCircle, FaUsers } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import MemberInfoSheet from "./MemberInfoSheet";
import { useLeaveGroup } from "@/hooks/useLeaveGroup";
// import RenameGroupDialog from "./RenameGroupDialog";
import AddMemberDialog from "./AddMemberDialog";
import Skeleton from "@/components/Skeleton";
import { useRenameGroup } from "@/hooks/useRenameGroup";
import { useUpdateGroupBio } from "@/hooks/useUpdateGroupBio";
import { useUploadGroupPic } from "@/hooks/useUploadGroupPic";
import { TiCamera } from "react-icons/ti";
import { useRef } from "react";

export default function GroupInfo() {

    const navigate = useNavigate();
    const { chatId } = useParams();
    const [selectedMember, setSelectedMember] = useState(null);

    const { data: chats } = useChats();
    const { data: meData } = useMe();
    const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup();
    const [editingName, setEditingName] = useState(false);
    const { mutate: renameGroup, isPending: isRenaming } = useRenameGroup();
    const [editingBio, setEditingBio] = useState(false);
    const group = chats.find(c => c._id === chatId);
    const groupPicRef = useRef(null);

    const { mutate: updateBio, isPending: isUpdatingBio } = useUpdateGroupBio();
    const { mutate: uploadGroupPic, isPending: isUploadingPic } = useUploadGroupPic();
    const [newName, setNewName] = useState(group.chatName);
    const [newBio, setNewBio] = useState(group?.groupBio || "");

    if (!chats) {
        return (
            <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <Skeleton className="h-4 w-24 ml-3" />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-32 mx-auto" />
                </div>
            </div>
        );
    }


    if (!group) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Group not found
            </div>
        );
    }

    const isAdmin = meData?.user?._id === group.groupAdmin;

    const handleLeaveGroup = () => {
        leaveGroup(chatId, {
            onSuccess: () => navigate("/"),
        });
    };
    const handleRename = () => {
        if (!newName.trim()) return;
        renameGroup({ chatId, groupName: newName }, {
            onSuccess: () => setEditingName(false)
        });
    };


    return (
        <>
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
                    <h2 className="font-semibold text-slate-800 text-sm px-2">Group info</h2>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">

                    {/* Group photo + name + bio */}
                    <div className="bg-white flex flex-col items-center py-6 px-4 border-b border-slate-200">
                        <div className="relative mb-3">
                            {group.groupPic ? (
                                <img
                                    src={group.groupPic}
                                    alt={group.chatName}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-violet-200"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center">
                                    <FaUsers className="text-4xl text-violet-600" />
                                </div>
                            )}
                            {/* camera — admin only */}
                            {isAdmin && (
                                <>
                                    <button
                                        onClick={() => groupPicRef.current?.click()}
                                        disabled={isUploadingPic}
                                        className="absolute bottom-0 right-0 h-7 w-7 bg-violet-600 rounded-full flex items-center justify-center border-2 border-white"
                                    >
                                        {isUploadingPic ? (
                                            <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <TiCamera size={13} className="text-white" />
                                        )}
                                    </button>

                                    <input
                                        ref={groupPicRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadGroupPic({ chatId, file });
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        {/* Group name with rename */}
                        <div className="flex items-center gap-2 mb-1">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleRename();
                                            if (e.key === "Escape") setEditingName(false);
                                        }}
                                        className="border border-violet-300 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-violet-100"
                                    />
                                    <button onClick={handleRename} className="text-xs text-violet-600 font-medium">
                                        {isRenaming ? "..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditingName(false)} className="text-xs text-slate-400">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-semibold text-slate-800 text-base">{group.chatName}</h2>
                                    {isAdmin && (
                                        <button onClick={() => { setEditingName(true); setNewName(group.chatName); }}>
                                            <MdEdit size={15} className="text-slate-400 hover:text-violet-600" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{group.users.length} members</p>

                        {/* Bio */}
                        {(isAdmin || group.groupBio) && (
                            <div className="w-full">
                                {editingBio ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={newBio}
                                            onChange={e => setNewBio(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") {
                                                    updateBio({ chatId, groupBio: newBio }, {
                                                        onSuccess: () => setEditingBio(false)
                                                    });
                                                }
                                                if (e.key === "Escape") setEditingBio(false);
                                            }}
                                            className="flex-1 text-sm border border-violet-300 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-violet-100"
                                        />
                                        <button
                                            onClick={() => updateBio({ chatId, groupBio: newBio }, { onSuccess: () => setEditingBio(false) })}
                                            disabled={isUpdatingBio}
                                            className="text-xs text-violet-600 font-medium"
                                        >
                                            {isUpdatingBio ? "..." : "Save"}
                                        </button>
                                        <button onClick={() => setEditingBio(false)} className="text-xs text-slate-400">
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <p className={`text-xs ${group.groupBio ? "text-slate-500" : "text-slate-400 italic"}`}>
                                            {group.groupBio || "Add group description..."}
                                        </p>
                                        {isAdmin && (
                                            <button onClick={() => { setEditingBio(true); setNewBio(group.groupBio || ""); }}>
                                                <MdEdit size={13} className="text-slate-400 hover:text-violet-600 shrink-0" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Add member — admin only */}
                    {isAdmin && (
                        <div className="bg-white mt-2 border-y border-slate-200">
                            <AddMemberDialog chatId={chatId} />
                        </div>
                    )}

                    {/* Members */}
                    <div className="bg-white mt-2 border-y border-slate-200">
                        <p className="text-xs font-medium text-slate-400 px-5 pt-3 pb-1">
                            Members ({group.users.length})
                        </p>

                        {group.users.map((user) => {
                            const isMe = user._id === meData?.user?._id;
                            const isGroupAdmin = user._id === group.groupAdmin;

                            return (
                                <div
                                    key={user._id}
                                    onClick={() => !isMe && setSelectedMember(user)}
                                    className={`
                                        flex items-center justify-between px-5 py-3
                                        border-b border-slate-100 last:border-b-0
                                        transition-colors
                                        ${!isMe ? "cursor-pointer hover:bg-slate-50" : ""}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {user?.privacy?.profilePic && user?.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full object-cover border-2 border-violet-100 shrink-0"
                                            />
                                        ) : (
                                            <FaUserCircle className="text-4xl text-violet-400 shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-400">@{user.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {isGroupAdmin && (
                                            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                                                Admin
                                            </span>
                                        )}
                                        {isMe && (
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leave group */}
                    <div className="p-4">
                        <button
                            onClick={handleLeaveGroup}
                            disabled={isLeaving}
                            className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            {isLeaving ? "Leaving..." : "Leave group"}
                        </button>
                    </div>

                </div>
            </div>

            <MemberInfoSheet
                open={!!selectedMember}
                onOpenChange={() => setSelectedMember(null)}
                member={selectedMember}
                isAdmin={isAdmin}
                currentUserId={meData?.user?._id}
                chatId={chatId}
            />
        </>
    );
}