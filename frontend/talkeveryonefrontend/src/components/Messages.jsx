import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";
import { FaUsers } from "react-icons/fa";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChatApi } from "@/api/chatApi";
import { MdDelete } from "react-icons/md";

export default function Messages() {

    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: meData } = useMe();
    const { data: chats, isLoading, isError } = useChats();

    const [selectedChat, setSelectedChat] = useState(null);
    const longPressTimer = useRef(null);
    const didLongPress = useRef(false);

    const { mutate: deleteChat } = useMutation({
        mutationFn: deleteChatApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            setSelectedChat(null);
            navigate("/");
        }
    });

    // mobile — long press
    const handleLongPressStart = (chatId) => {
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            setSelectedChat(prev => prev === chatId ? null : chatId);
        }, 500);
    };

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimer.current);
    };

    // desktop — right click
    const handleContextMenu = (e, chatId) => {
        e.preventDefault();
        setSelectedChat(prev => prev === chatId ? null : chatId);
    };

    // navigate rokna jab long press ya select mode ho
    const handleItemClick = (e) => {
        if (didLongPress.current) {
            e.preventDefault();
            didLongPress.current = false;
            return;
        }
        if (selectedChat) {
            e.preventDefault();
        }
    };

    if (isLoading) {
        return (
            <div className="p-3 space-y-3">
                {[...Array(10)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
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
                <h3 className="font-semibold text-slate-700">No conversations yet</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Start a new chat by clicking the + button
                </p>
            </div>
        );
    }

    const formatChatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isToday) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
        if (isYesterday) return "Yesterday";
        return date.toLocaleDateString([], { day: "numeric", month: "short" });
    };

    return (
        <div className="p-2">

            {/* select mode mein delete header */}
            {selectedChat && (
                <div className="flex items-center justify-between px-2 py-2 mb-2 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-500 font-medium">1 selected</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => deleteChat(selectedChat)}
                            className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
                        >
                            <MdDelete size={20} />
                        </button>
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <ItemGroup className="gap-1">
                {chats.map((chat) => {
                    const otherUser = chat.users.find(u => u._id !== meData?.user?._id);
                    const chatPath = chat.isGroupChat ? `/group/${chat._id}` : `/chat/${chat._id}`;
                    const isActive = location.pathname === chatPath;

                    return (
                        <Item
                            key={chat._id}
                            // mobile
                            onTouchStart={() => handleLongPressStart(chat._id)}
                            onTouchEnd={handleLongPressEnd}
                            // desktop
                            onMouseDown={() => handleLongPressStart(chat._id)}
                            onMouseUp={handleLongPressEnd}
                            onMouseLeave={handleLongPressEnd}
                            onContextMenu={(e) => handleContextMenu(e, chat._id)}
                            variant="outline"
                            asChild
                            role="listitem"
                            className={`
                                border-0 rounded-2xl transition-all duration-200 px-2 py-1
                                ${isActive ? "bg-violet-100" : "hover:bg-violet-50"}
                                ${selectedChat === chat._id ? "bg-red-50 border border-red-200" : ""}
                            `}
                        >
                            <Link
                                to={chatPath}
                                onClick={handleItemClick}
                            >
                                <ItemMedia variant="image">
                                    {chat.isGroupChat ? (
                                        <div className="h-12 w-12 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center">
                                            <FaUsers className="text-violet-600 text-lg" />
                                        </div>
                                    ) : (
                                        <img
                                            src={dummyprofilepic}
                                            alt={otherUser?.name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 rounded-full object-cover border-2 border-violet-200"
                                        />
                                    )}
                                </ItemMedia>

                                <ItemContent className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <ItemTitle className="text-slate-800 font-semibold truncate">
                                            {chat.isGroupChat ? chat.chatName : otherUser?.name}
                                        </ItemTitle>
                                        <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                                            <ItemDescription className="text-xs text-slate-400">
                                                {formatChatTime(chat.updatedAt)}
                                            </ItemDescription>
                                            {chat.unreadCount > 0 && (
                                                <span className="bg-violet-600 text-white text-xs rounded-full px-2 py-0.5 leading-none">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ItemDescription className="text-sm text-slate-500 truncate mt-1">
                                        {chat.latestMessage?.content || (chat.isGroupChat ? "Group created" : "Start chatting...")}
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