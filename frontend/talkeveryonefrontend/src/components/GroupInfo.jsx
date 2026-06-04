import { useState } from "react";
import { FaArrowLeft, FaUserCircle, FaUsers } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import MemberInfoSheet from "./MemberInfoSheet";
import { useLeaveGroup } from "@/hooks/useLeaveGroup";
import RenameGroupDialog from "./RenameGroupDialog";
import AddMemberDialog from "./AddMemberDialog";

export default function GroupInfo() {

    const navigate = useNavigate();
    const { chatId } = useParams();

    const [selectedMember, setSelectedMember] = useState(null);

    const { data: chats } = useChats();
    const { data: meData } = useMe();

    const { mutate: leaveGroup } = useLeaveGroup();

    if (!chats) {
        return (
            <div className="flex items-center justify-center h-full">
                Loading...
            </div>
        );
    }

    const group = chats.find(
        (chat) => chat._id === chatId
    );

    if (!group) {
        return (
            <div className="flex items-center justify-center h-full">
                Group not found
            </div>
        );
    }

    const isAdmin =
        meData?.user?._id === group.groupAdmin;

    const handleLeaveGroup = () => {
        leaveGroup(chatId, {
            onSuccess: () => {
                navigate("/");
            },
        });
    };

    return (
        <>
            <div className="w-full h-full bg-slate-50 overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex items-center gap-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-slate-100"
                    >
                        <FaArrowLeft />
                    </button>

                    <h2 className="font-semibold text-lg">
                        Group Info
                    </h2>

                </div>

                {/* Group Details */}
                <div className="bg-white flex flex-col items-center py-8">

                    <div
                        className="
                            h-24
                            w-24
                            rounded-full
                            bg-violet-100
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <FaUsers className="text-4xl text-violet-600" />
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-800">
                        {group.chatName}
                    </h2>

                    <p className="text-slate-500 text-sm">
                        {group.users.length}{" "}
                        {group.users.length === 1
                            ? "Member"
                            : "Members"}
                    </p>

                    {isAdmin && (
                        <RenameGroupDialog
                            chatId={chatId}
                            currentName={group.chatName}
                        />
                    )}

                </div>

                {/* Actions */}
                {isAdmin && (
                    <div className="bg-white mt-3 p-4">
                        <AddMemberDialog
                            chatId={chatId}
                        />
                    </div>
                )}

                {/* Members */}
                <div className="bg-white mt-3">

                    <div className="p-4 border-b">
                        <h3 className="font-semibold">
                            Members
                        </h3>
                    </div>

                    {group.users.map((user) => (

                        <div
                            key={user._id}
                            onClick={() => setSelectedMember(user)}
                            className="
                                flex
                                items-center
                                justify-between
                                px-4
                                py-3
                                border-b
                                hover:bg-slate-50
                                cursor-pointer
                            "
                        >

                            <div className="flex items-center gap-3">

                                <FaUserCircle className="text-4xl text-violet-500" />

                                <div>

                                    <p className="font-medium text-slate-800">
                                        {user.name}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        @{user.username}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                {user._id === meData?.user?._id && (
                                    <span
                                        className="
                                            text-xs
                                            bg-slate-100
                                            text-slate-600
                                            px-2
                                            py-1
                                            rounded-full
                                        "
                                    >
                                        You
                                    </span>
                                )}

                                {user._id === group.groupAdmin && (
                                    <span
                                        className="
                                            text-xs
                                            bg-violet-100
                                            text-violet-700
                                            px-2
                                            py-1
                                            rounded-full
                                        "
                                    >
                                        Admin
                                    </span>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

                {/* Leave Group */}
                <div className="p-4">

                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLeaveGroup}
                    >
                        Leave Group
                    </Button>

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