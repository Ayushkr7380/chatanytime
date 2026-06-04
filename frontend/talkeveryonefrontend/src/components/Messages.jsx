import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Link, useLocation } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";
import { FaUsers } from "react-icons/fa";

export default function Messages() {

    const location = useLocation();

    const { data: meData } = useMe();

    const {
        data: chats,
        isLoading,
        isError,
    } = useChats();

    if (isLoading) {
        return (
            <div className="p-3 space-y-3">
                {[...Array(10)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3"
                    >
                        <Skeleton className="h-12 w-12 rounded-full" />

                        <div className="flex-1">
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Failed to load chats
            </div>
        );
    }

    if (!chats?.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <h3 className="font-semibold text-slate-700">
                    No conversations yet
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                    Start a new chat by clicking the + button
                </p>
            </div>
        );
    }

    const formatChatTime = (dateStr) => {

        const date = new Date(dateStr);
        const now = new Date();

        const isToday =
            date.toDateString() === now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const isYesterday =
            date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }

        if (isYesterday) {
            return "Yesterday";
        }

        return date.toLocaleDateString([], {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <div className="p-2">

            <ItemGroup className="gap-1">

                {chats.map((chat) => {

                    const otherUser = chat.users.find(
                        (u) => u._id !== meData?.user?._id
                    );

                    const chatPath = chat.isGroupChat
                        ? `/group/${chat._id}`
                        : `/chat/${chat._id}`;

                    const isActive =
                        location.pathname === chatPath;

                    return (
                        <Item
                            key={chat._id}
                            variant="outline"
                            asChild
                            role="listitem"
                            className={`
                                border-0
                                rounded-2xl
                                transition-all
                                duration-200
                                px-2
                                py-1
                                ${
                                    isActive
                                        ? "bg-violet-100"
                                        : "hover:bg-violet-50"
                                }
                            `}
                        >
                            <Link to={chatPath}>

                                <ItemMedia variant="image">

                                    {chat.isGroupChat ? (
                                        <div
                                            className="
                                                h-12
                                                w-12
                                                rounded-full
                                                bg-violet-100
                                                border-2
                                                border-violet-200
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            <FaUsers
                                                className="
                                                    text-violet-600
                                                    text-lg
                                                "
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={dummyprofilepic}
                                            alt={otherUser?.name}
                                            width={48}
                                            height={48}
                                            className="
                                                h-12
                                                w-12
                                                rounded-full
                                                object-cover
                                                border-2
                                                border-violet-200
                                            "
                                        />
                                    )}

                                </ItemMedia>

                                <ItemContent className="flex-1 min-w-0">

                                    <div className="flex items-center justify-between">

                                        <ItemTitle className="text-slate-800 font-semibold truncate">

                                            {chat.isGroupChat
                                                ? chat.chatName
                                                : otherUser?.name}

                                        </ItemTitle>

                                        <div className="flex flex-col items-end gap-1 ml-2 shrink-0">

                                            <ItemDescription className="text-xs text-slate-400">
                                                {formatChatTime(chat.updatedAt)}
                                            </ItemDescription>

                                            {chat.unreadCount > 0 && (
                                                <span
                                                    className="
                                                        bg-violet-600
                                                        text-white
                                                        text-xs
                                                        rounded-full
                                                        px-2
                                                        py-0.5
                                                        leading-none
                                                    "
                                                >
                                                    {chat.unreadCount}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    <ItemDescription className="text-sm text-slate-500 truncate mt-1">

                                        {chat.latestMessage?.content ||
                                            (chat.isGroupChat
                                                ? "Group created"
                                                : "Start chatting...")}

                                    </ItemDescription>

                                </ItemContent>

                            </Link>
                        </Item>
                    );
                })}

            </ItemGroup>

        </div>
    );
}