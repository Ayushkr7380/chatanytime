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
import { deleteChatApi, clearChatApi } from "@/api/chatApi";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Camera, FileText, Folder, Loader2 } from "lucide-react"; 

export default function Messages() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: meData } = useMe();
    const { data: chats, isLoading, isError } = useChats();

    const [selectedChat, setSelectedChat] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const longPressTimer = useRef(null);
    const didLongPress = useRef(false);
    const touchMoved = useRef(false);

    const selectedChatObj = chats?.find(c => c._id === selectedChat);

    const { mutate: deleteChat, isPending: isDeleting } = useMutation({
        mutationFn: deleteChatApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            setSelectedChat(null);
            setModalOpen(false);
            navigate("/");
        }
    });

    const { mutate: clearChat, isPending: isClearing } = useMutation({
        mutationFn: clearChatApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            queryClient.removeQueries({ queryKey: ["messages", selectedChat] });
            setSelectedChat(null);
            setModalOpen(false);
        }
    });

    const handlePointerDown = (chatId) => {
        touchMoved.current = false;
        didLongPress.current = false;

        longPressTimer.current = setTimeout(() => {
            if (!touchMoved.current) {
                didLongPress.current = true;
                setSelectedChat(chatId);
            }
        }, 500);
    };

    const handlePointerMove = () => {
        touchMoved.current = true;
        clearTimeout(longPressTimer.current);
    };

    const handlePointerUp = () => {
        clearTimeout(longPressTimer.current);
    };

    const handleItemClick = (e) => {
        if (didLongPress.current) {
            e.preventDefault();
            e.stopPropagation();

            setTimeout(() => {
                didLongPress.current = false;
            }, 100);

            return;
        }

        if (selectedChat) {
            e.preventDefault();
        }
    };

    const handleContextMenu = (e, chatId) => {
        e.preventDefault();
        setSelectedChat(chatId);
    };

    const handleCancel = () => {
        setSelectedChat(null);
        setModalOpen(false);
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
            <div className="flex items-center justify-center h-full text-red-500 font-medium py-10">
                Failed to load chats
            </div>
        );
    }

    if (!chats?.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-20">
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

    const getLatestMessageText = (chat) => {
        const entry = chat.deletedFor?.find(
            d => d.userId === meData?.user?._id
        );

        if (entry?.isCleared && chat.latestMessage) {
            const msgTime = new Date(chat.latestMessage.createdAt);
            const clearedTime = new Date(entry.clearedAt);
            if (msgTime <= clearedTime) {
                return chat.isGroupChat ? "Group created" : "Start chatting...";
            }
        }

        const msg = chat.latestMessage;
        if (!msg) return chat.isGroupChat ? "Group created" : "Start chatting...";

        // Handled dynamic icon styling for inline attachments
        if (msg.messageType === "image") return <span className="flex items-center gap-1"><Camera size={14} className="text-slate-400 shrink-0" /> Image</span>;
        if (msg.messageType === "pdf") return <span className="flex items-center gap-1"><FileText size={14} className="text-slate-400 shrink-0" /> {msg.fileName || "PDF"}</span>;
        if (msg.messageType === "file") return <span className="flex items-center gap-1"><Folder size={14} className="text-slate-400 shrink-0" /> {msg.fileName || "File"}</span>;

        return msg.content || (chat.isGroupChat ? "Group created" : "Start chatting...");
    };

    return (
        <div className="p-2">

            {/* Selected Header Action Top Bar */}
            {selectedChat && (
                <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-sm text-slate-600 font-medium">1 selected</p>

                    {isDeleting || isClearing ? (
                        <div className="flex items-center gap-2 px-2">
                            <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
                            <span className="text-xs text-slate-500 font-medium">Please wait...</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <button
                                    onClick={() => setModalOpen(prev => !prev)}
                                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <BsThreeDotsVertical size={18} />
                                </button>

                                {modalOpen && (
                                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-100 w-36 z-50 overflow-hidden">
                                        <button
                                            onClick={() => clearChat(selectedChat)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            Clear Chat
                                        </button>
                                        {!selectedChatObj?.isGroupChat && (
                                            <button
                                                onClick={() => deleteChat(selectedChat)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                                            >
                                                Delete Chat
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!selectedChatObj?.isGroupChat && (
                                <button
                                    onClick={() => deleteChat(selectedChat)}
                                    className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                >
                                    <MdDelete size={20} />
                                </button>
                            )}

                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Chat List Items */}
            <ItemGroup className="gap-1">
                {chats.map((chat) => {
                    const otherUser = chat.users.find(u => u._id !== meData?.user?._id);
                    const chatPath = chat.isGroupChat ? `/group/${chat._id}` : `/chat/${chat._id}`;
                    const isActive = location.pathname === chatPath;

                    return (
                        <Item
                            key={chat._id}
                            onPointerDown={() => handlePointerDown(chat._id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onContextMenu={(e) => handleContextMenu(e, chat._id)}
                            variant="outline"
                            asChild
                            role="listitem"
                            className={`
                                border-0 rounded-2xl transition-all duration-200 px-2 py-1
                                ${isActive ? "bg-violet-100" : "hover:bg-violet-50"}
                                ${selectedChat === chat._id ? "bg-violet-50 border border-violet-200" : ""}
                            `}
                        >
                            <Link to={chatPath} onClick={handleItemClick}>
                                <ItemMedia variant="image">
                                    {chat.isGroupChat ? (
                                        chat.groupPic ? (
                                            <img
                                                src={chat.groupPic}
                                                alt={chat.chatName}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 rounded-full object-cover border-2 border-violet-200"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center shadow-sm">
                                                <FaUsers className="text-violet-600 text-lg" />
                                            </div>
                                        )
                                    ) : (
                                        <img
                                            src={
                                                otherUser?.privacy?.profilePic
                                                    ? (otherUser?.profilePic || dummyprofilepic)
                                                    : dummyprofilepic
                                            }
                                            alt={otherUser?.name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 rounded-full object-cover border-2 border-violet-200"
                                        />
                                    )}
                                </ItemMedia>

                                <ItemContent className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <ItemTitle className="text-slate-800 font-semibold truncate text-sm">
                                            {chat.isGroupChat ? chat.chatName : otherUser?.name}
                                        </ItemTitle>
                                        <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                                            <ItemDescription className="text-xs text-slate-400">
                                                {formatChatTime(chat.updatedAt)}
                                            </ItemDescription>
                                            {chat.unreadCount > 0 && (
                                                <span className="bg-violet-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 leading-none min-w-[18px] text-center">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ItemDescription className="text-sm text-slate-500 truncate mt-0.5 flex items-center">
                                        {getLatestMessageText(chat)}
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