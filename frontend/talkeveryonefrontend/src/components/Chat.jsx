import { FaUserCircle } from "react-icons/fa";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoArrowBack, IoSend } from "react-icons/io5";
import socket from "@/websocket/Socket";
import { useMessages } from "@/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";
import { useMarkRead } from "@/hooks/useMarkRead";
import { useUserStatus } from "@/hooks/useUserStatus";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import { TypingBubble } from "./TypingBubble";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import { useUnblockUser } from "@/hooks/useUnblockUser";
import { useChats } from "@/hooks/useChats";

export default function Chat() {

    const bottomRef = useRef(null);
    const navigate = useNavigate();
    const { chatId } = useParams();

    const { data: meData } = useMe();
    const { data: chats = [] } = useChats();
    const queryClient = useQueryClient();

    const { data: messages = [], isLoading } = useMessages(chatId);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markRead } = useMarkRead();

    const { startTyping, stopTyping } = useContext(CreateSocketContext);
    const [otherTyping, setOtherTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    const currentChat = chats.find((chat) => chat._id === chatId);
    const otherUser = currentChat?.users?.find((u) => u._id !== meData?.user?._id);
    const otherUserId = otherUser?._id;

    const { data: blockStatus } = useBlockStatus(otherUserId);
    const { mutate: unblockUser } = useUnblockUser();
    const { data: statusData } = useUserStatus(otherUserId);

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "";
        const date = new Date(lastSeen);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return `Last seen today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
        } else if (isYesterday) {
            return `Last seen yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
        } else {
            return `Last seen ${date.toLocaleDateString([], { day: "numeric", month: "short" })}`;
        }
    };

    const handleTyping = () => {
        startTyping(chatId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(chatId);
        }, 2000);
    };

    useEffect(() => {
        markRead(chatId);
    }, [chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, [messages, otherTyping]);

    useEffect(() => {
        const joinRoom = () => socket.emit("joinChat", chatId);

        if (socket.connected) joinRoom();
        socket.on("connect", joinRoom);

        const handleReceiveMessage = (msgData) => {
            if (msgData.chatId === chatId) {
                queryClient.setQueryData(["messages", chatId], (prev) => [
                    ...(prev || []),
                    msgData,
                ]);
                markRead(chatId);
            }
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        };

        const handleMessagesRead = ({ chatId: readChatId }) => {
            if (readChatId === chatId) {
                queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messagesRead", handleMessagesRead);

        socket.on("userStatusUpdate", (data) => {
            if (data.userId === otherUserId) {
                queryClient.setQueryData(["status", otherUserId], {
                    isOnline: data.isOnline,
                    lastSeen: data.lastSeen,
                });
            }
        });

        socket.on("typing", ({ chatId: typingChatId }) => {
            if (typingChatId !== chatId) return;
            setOtherTyping(true);
        });

        socket.on("stopTyping", ({ chatId: typingChatId }) => {
            if (typingChatId !== chatId) return;
            setOtherTyping(false);
        });

        socket.on("userBlocked", () => {
            queryClient.invalidateQueries({ queryKey: ["block-status"] });
            queryClient.invalidateQueries({ queryKey: ["status"] });
        });

        socket.on("userUnblocked", () => {
            queryClient.invalidateQueries({ queryKey: ["block-status"] });
            queryClient.invalidateQueries({ queryKey: ["status"] });
        });

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("userStatusUpdate");
            socket.off("messagesRead", handleMessagesRead);
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("userBlocked");
            socket.off("userUnblocked");
        };
    }, [chatId, queryClient]);

    const { register, handleSubmit, watch, reset } = useForm();
    const messageValue = watch("content");

    const onSubmit = ({ content }) => {
        sendMessage({ content, chatId });
        reset();
    };

    if (isLoading) {
        return (
            <div className="w-full h-[100dvh] flex flex-col bg-slate-50">
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4" style={{ overflowY: "auto" }}>
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                        >
                            <Skeleton className="h-12 w-52 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[100dvh] flex flex-col bg-slate-50">

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <div className="flex items-center gap-1">

                    <button
                        onClick={() => navigate("/")}
                        className="
                            md:hidden
                            p-2
                            rounded-xl
                            hover:bg-slate-100
                            active:bg-slate-200
                            transition-colors
                            shrink-0
                        "
                    >
                        <IoArrowBack size={20} className="text-slate-700" />
                    </button>

                    <div
                        onClick={() => navigate(`/chat/${chatId}/info`)}
                        className="
                            flex
                            items-center
                            gap-3
                            cursor-pointer
                            hover:bg-slate-50
                            active:bg-slate-100
                            rounded-xl
                            px-2
                            py-1.5
                            transition-colors
                            min-w-0
                        "
                    >
                        <FaUserCircle className="text-4xl text-violet-500 shrink-0" />

                        <div className="min-w-0">
                            <h2 className="font-semibold text-slate-800 text-sm truncate">
                                {otherUser?.name}
                            </h2>

                            {otherTyping ? (
                                <p className="text-xs text-violet-500 animate-pulse">
                                    typing...
                                </p>
                            ) : statusData?.hidden ? (
                                <p className="text-xs text-slate-400">
                                    Status unavailable
                                </p>
                            ) : statusData?.isOnline ? (
                                <p className="text-xs text-green-500 font-medium">
                                    Online
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400 truncate">
                                    {formatLastSeen(statusData?.lastSeen)}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 p-4 bg-slate-50 no-scrollbar"
                style={{ overflowY: "auto" }}
            >
                {messages?.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        text={msg.content}
                        isSender={msg?.sender?._id === meData?.user?._id}
                        time={new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}
                        isRead={msg?.readBy?.includes(otherUserId)}
                    />
                ))}
                {otherTyping && <TypingBubble />}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            {blockStatus?.isBlockedByMe ? (

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="text-center">
                        <p className="text-sm text-slate-500">
                            You have blocked this user
                        </p>
                        <button
                            onClick={() => unblockUser(otherUserId)}
                            className="
                                mt-3
                                px-5
                                py-2.5
                                rounded-xl
                                bg-violet-600
                                text-white
                                text-sm
                                font-medium
                                hover:bg-violet-700
                                active:bg-violet-800
                                transition-colors
                            "
                        >
                            Unblock User
                        </button>
                    </div>
                </div>

            ) : blockStatus?.blockedMe ? (

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <p className="text-center text-sm text-slate-500">
                        This user has blocked you
                    </p>
                </div>

            ) : (

                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            {...register("content", {
                                required: "message is required",
                            })}
                            onChange={(e) => {
                                register("content").onChange(e);
                                handleTyping();
                            }}
                            className="
                                flex-1
                                min-w-0
                                border
                                border-slate-200
                                rounded-xl
                                px-4
                                py-3
                                text-sm
                                outline-none
                                focus:border-violet-400
                                focus:ring-2
                                focus:ring-violet-100
                                bg-slate-50
                                transition-all
                            "
                        />

                        <button
                            type="submit"
                            disabled={!messageValue || messageValue.trim() === ""}
                            className="
                                h-12
                                w-12
                                flex
                                items-center
                                justify-center
                                rounded-xl
                                bg-violet-600
                                text-white
                                hover:bg-violet-700
                                active:bg-violet-800
                                transition-colors
                                disabled:opacity-40
                                shrink-0
                            "
                        >
                            <IoSend size={18} />
                        </button>
                    </form>
                </div>

            )}

        </div>
    );
}