import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";

import { useBlockStatus } from "@/hooks/useBlockStatus";
import { useBlockUser } from "@/hooks/useBlockUser";
import { useUnblockUser } from "@/hooks/useUnblockUser";

export default function UserInfo() {

    const navigate = useNavigate();
    const { chatId } = useParams();

    const { data: chats } = useChats();
    const { data: meData } = useMe();
     const { data: blockStatus } =useBlockStatus(otherUser?._id);

    const { mutate: blockUser,isPending: blockingUser} = useBlockUser();

    const { mutate: unblockUser,isPending: unblockingUser} = useUnblockUser();


    if (!chats) {
        return (
            <div className="flex items-center justify-center h-full">
                Loading...
            </div>
        );
    }

    const chat = chats.find(
        (chat) => chat._id === chatId
    );

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full">
                User not found
            </div>
        );
    }

    const otherUser = chat.users.find(
        (user) =>
            user._id !== meData?.user?._id
    );

   
    const handleBlockUser = () => {
        blockUser(otherUser._id);
    };

    const handleUnblockUser = () => {
        unblockUser(otherUser._id);
    };

    return (
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
                    Contact Info
                </h2>

            </div>

            {/* Profile */}
            <div className="bg-white flex flex-col items-center py-10">

                <FaUserCircle
                    className="
                        text-9xl
                        text-violet-500
                    "
                />

                <h2 className="mt-5 text-2xl font-bold text-slate-800">
                    {otherUser?.name}
                </h2>

                <p className="text-slate-500">
                    @{otherUser?.username}
                </p>

            </div>

            {/* Details */}
            <div className="bg-white mt-3 p-5">

                <div className="mb-5">

                    <p className="text-xs text-slate-400">
                        Email
                    </p>

                    <p className="text-slate-800 mt-1">
                        {otherUser?.email}
                    </p>

                </div>

                <div>

                    <p className="text-xs text-slate-400">
                        Username
                    </p>

                    <p className="text-slate-800 mt-1">
                        @{otherUser?.username}
                    </p>

                </div>

            </div>

            {/* Block Status */}
            {blockStatus?.blockedMe && (

                <div className="mx-4 mt-4 p-4 rounded-xl bg-red-50 border border-red-200">

                    <p className="text-sm text-red-600 text-center">
                        This user has blocked you.
                    </p>

                </div>

            )}

            {/* Danger Zone */}
            <div className="p-4">

                {blockStatus?.isBlockedByMe ? (

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleUnblockUser}
                        disabled={unblockingUser}
                    >
                        {
                            unblockingUser
                                ? "Unblocking..."
                                : "Unblock User"
                        }
                    </Button>

                ) : (

                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleBlockUser}
                        disabled={blockingUser}
                    >
                        {
                            blockingUser
                                ? "Blocking..."
                                : "Block User"
                        }
                    </Button>

                )}

            </div>

        </div>
    );
}