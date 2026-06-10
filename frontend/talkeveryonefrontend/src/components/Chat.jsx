import { FaUserCircle } from "react-icons/fa";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
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
import { useDeleteMessageForMe } from "@/hooks/useDeleteMessageForMe";
import { useDeleteMessageForEveryone } from "@/hooks/useDeleteMessageForEveryone";
import { useEditMessage } from "@/hooks/useEditMessage";
import { GrAttachment } from "react-icons/gr";

export default function Chat() {

    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);
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

    const [selectedMessages, setSelectedMessages] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);

    const currentChat = chats.find((chat) => chat._id === chatId);
    const otherUser = currentChat?.users?.find((u) => u._id !== meData?.user?._id);
    const otherUserId = otherUser?._id;

    const { data: blockStatus } = useBlockStatus(otherUserId);
    const { mutate: unblockUser } = useUnblockUser();
    const { data: statusData } = useUserStatus(otherUserId);

    const { mutate: deleteForMe, isPending: isDeletingForMe } = useDeleteMessageForMe(chatId);
    const { mutate: deleteForEveryone, isPending: isDeletingForEveryone } = useDeleteMessageForEveryone();
    const { mutate: editMessage, isPending: isEditing } = useEditMessage();

    const [attachOpen, setAttachOpen] = useState(false);
    const imageRef = useRef(null);
    const pdfRef = useRef(null);
    const fileRef = useRef(null);
    const cameraRef = useRef(null);


    const handleFileSelect = (files) => {
        if (!files?.length) return;
        sendMessage({ files: Array.from(files), chatId });
        setAttachOpen(false);
    };

    const isPending = isDeletingForMe || isDeletingForEveryone || isEditing;

    const allSelectedAreMine = selectedMessages.every(id => {
        const msg = messages.find(m => m._id === id);
        return msg?.sender?._id === meData?.user?._id;
    });

    const isSingleSelected = selectedMessages.length === 1;
    const selectedMsg = isSingleSelected ? messages.find(m => m._id === selectedMessages[0]) : null;
    const isSelectedMsgEditable = selectedMsg?.messageType === "user" || !selectedMsg?.messageType;

    const handleSelectMessage = (messageId) => {
        setSelectedMessages(prev =>
            prev.includes(messageId)
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        );
        setMenuOpen(false);
    };

    const handleDeleteForMe = () => {
        selectedMessages.forEach(id => deleteForMe(id));
        setSelectedMessages([]);
        setMenuOpen(false);
    };

    const handleDeleteForEveryone = () => {
        selectedMessages.forEach(id => deleteForEveryone(id));
        setSelectedMessages([]);
        setMenuOpen(false);
    };

    const handleEditStart = () => {
        if (!selectedMsg) return;
        setEditingMessage({ id: selectedMsg._id, content: selectedMsg.content });
        setValue("content", selectedMsg.content);
        setSelectedMessages([]);
        setMenuOpen(false);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        reset();
    };

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "";
        const date = new Date(lastSeen);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isToday) return `Last seen today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
        else if (isYesterday) return `Last seen yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
        else return `Last seen ${date.toLocaleDateString([], { day: "numeric", month: "short" })}`;
    };

    const handleTyping = () => {
        startTyping(chatId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => stopTyping(chatId), 2000);
    };

    useEffect(() => {
        markRead(chatId);
        setSelectedMessages([]);
        setMenuOpen(false);
        setEditingMessage(null);
    }, [chatId]);

    useEffect(() => {
        const chat = chats?.find(c => c._id === chatId);
        const hasCleared = chat?.deletedFor?.some(
            d => d.userId.toString() === meData?.user?._id.toString() && !d.isCleared
        );
        if (hasCleared) {
            queryClient.removeQueries({ queryKey: ["messages", chatId] });
        } else {
            queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
        }
    }, [chatId, meData?.user?._id]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
    }, [messages, otherTyping]);

    useEffect(() => {
        const joinRoom = () => socket.emit("joinChat", chatId);
        if (socket.connected) joinRoom();
        socket.on("connect", joinRoom);

        const handleReceiveMessage = (msgData) => {
    if (msgData.chatId === chatId) {
        queryClient.setQueryData(["messages", chatId], (prev = []) => {
            const filtered = prev.filter(msg => !msg.optimistic);
            return [...filtered, msgData];
        });
        markRead(chatId);
    }
    queryClient.invalidateQueries({ queryKey: ["chats"] });
};

        const handleMessagesRead = ({ chatId: readChatId }) => {
            if (readChatId === chatId) {
                queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
            }
        };


        const handleMessageDeleted = ({ messageId }) => {
            queryClient.setQueryData(["messages", chatId], (prev = []) =>
                prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, isDeleted: true, content: "This message was deleted" }
                        : msg
                )
            );
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        };


        const handleMessageUpdated = ({ messageId, content, isEdited }) => {
            queryClient.setQueryData(["messages", chatId], (prev = []) =>
                prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, content, isEdited }
                        : msg
                )
            );
        };
        const handlePrivacyUpdate = (data) => {

            if (data.userId !== otherUserId) return;

            queryClient.setQueryData(
                ["status", otherUserId],
                (old = {}) => ({
                    ...old,
                    profilePic: data.privacy?.profilePic
                        ? data.profilePic
                        : null,

                    bio: data.privacy?.bio
                        ? data.bio
                        : null,

                    isOnline: data.privacy?.onlineStatus
                        ? data.isOnline
                        : false,

                    lastSeen: data.privacy?.lastSeen
                        ? data.lastSeen
                        : null,
                })
            );
        };

        socket.on(
            "userPrivacyUpdated",
            handlePrivacyUpdate
        );

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messagesRead", handleMessagesRead);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("messageUpdated", handleMessageUpdated);

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
            socket.off("messagesRead", handleMessagesRead);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("userStatusUpdate");
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("userBlocked");
            socket.off("userUnblocked");
            socket.off(
                "userPrivacyUpdated",
                handlePrivacyUpdate
            );
        };
    }, [chatId, queryClient, otherUserId]);

    const { register, handleSubmit, watch, reset, setValue } = useForm();
    const messageValue = watch("content");

    const onSubmit = ({ content }) => {
        if (editingMessage) {
            editMessage(
                { messageId: editingMessage.id, content },
                {
                    onSuccess: () => {
                        setEditingMessage(null);
                        reset();
                    }
                }
            );
        } else {
            sendMessage({ content, chatId });
            reset();
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4" style={{ overflowY: "auto" }}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                            <Skeleton className="h-12 w-52 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col bg-slate-50" style={{ height: 'var(--app-height)' }}>

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                {selectedMessages.length > 0 ? (
                    // select mode header
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-slate-600 font-medium">
                            {selectedMessages.length} selected
                        </p>

                        {isPending ? (
                            <div className="flex items-center gap-2 px-2">
                                <div className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-500">Please wait...</span>
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(prev => !prev)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    >
                                        <BsThreeDotsVertical size={18} />
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-100 w-44 z-50 overflow-hidden">
                                            <button
                                                onClick={handleDeleteForMe}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                Delete for me
                                            </button>
                                            {allSelectedAreMine && !selectedMsg?.isDeleted && (
                                                <button
                                                    onClick={handleDeleteForEveryone}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    Delete for everyone
                                                </button>
                                            )}
                                            {isSingleSelected && allSelectedAreMine && !selectedMsg?.isDeleted && isSelectedMsgEditable &&(
                                                <button
                                                    onClick={handleEditStart}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    Edit message
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setSelectedMessages([]); setMenuOpen(false); }}
                                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // normal header
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate("/")}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                        >
                            <IoArrowBack size={20} className="text-slate-700" />
                        </button>
                        <div
                            onClick={() => navigate(`/chat/${chatId}/info`)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors min-w-0"
                        >
                            {statusData?.profilePic ? (
                                <img
                                    src={statusData.profilePic}
                                    alt={otherUser?.name}
                                    className="h-10 w-10 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <FaUserCircle className="text-4xl text-violet-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <h2 className="font-semibold text-slate-800 text-sm truncate">{otherUser?.name}</h2>
                                {otherTyping ? (
                                    <p className="text-xs text-violet-500 animate-pulse">typing...</p>
                                ) : statusData?.hidden ? (
                                    <p className="text-xs text-slate-400">Status unavailable</p>
                                ) : statusData?.isOnline ? (
                                    <p className="text-xs text-green-500 font-medium">Online</p>
                                ) : (
                                    <p className="text-xs text-slate-400 truncate">{formatLastSeen(statusData?.lastSeen)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 p-4 bg-slate-50 no-scrollbar overflow-y-auto"
            >
                {messages?.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        messageId={msg._id}
                        text={msg.content}
                        isSender={msg?.sender?._id === meData?.user?._id}
                        time={new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                        isRead={msg?.readBy?.includes(otherUserId)}
                        isDeleted={msg.isDeleted}
                        isEdited={msg.isEdited}
                        messageType={msg.messageType}
                        fileName={msg.fileName}
                        isSelected={selectedMessages.includes(msg._id)}
                        onSelect={handleSelectMessage}
                    />
                ))}
                {otherTyping && <TypingBubble />}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            {blockStatus?.isBlockedByMe ? (
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="text-center">
                        <p className="text-sm text-slate-500">You have blocked this user</p>
                        <button
                            onClick={() => unblockUser(otherUserId)}
                            className="mt-3 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 active:bg-violet-800 transition-colors"
                        >
                            Unblock User
                        </button>
                    </div>
                </div>
            ) : blockStatus?.blockedMe ? (
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <p className="text-center text-sm text-slate-500">This user has blocked you</p>
                </div>
            ) : (
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                    {editingMessage && (
                        <div className="flex items-center justify-between px-2 py-1 mb-2 bg-violet-50 rounded-xl border border-violet-200">
                            <p className="text-xs text-violet-600">Editing message</p>
                            <button onClick={handleCancelEdit} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        </div>
                    )}

                    {/* Attachment menu */}
                    {attachOpen && (
                        <div className="flex gap-2 mb-2 px-1">
                            {[
                                { ref: imageRef, accept: "image/*", icon: "🖼️", label: "Image", bg: "bg-violet-50" },
                                { ref: pdfRef, accept: "application/pdf", icon: "📄", label: "PDF", bg: "bg-red-50" },
                                { ref: fileRef, accept: "*", icon: "📁", label: "File", bg: "bg-blue-50" },
                                { ref: cameraRef, accept: "image/*", capture: "environment", icon: "📷", label: "Camera", bg: "bg-green-50" },
                            ].map(({ ref, accept, capture, icon, label, bg }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => ref.current?.click()}
                                    className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl ${bg}`}
                                >
                                    <span className="text-lg">{icon}</span>
                                    <span className="text-[10px] text-slate-500">{label}</span>
                                    <input
                                        ref={ref}
                                        type="file"
                                        accept={accept}
                                        capture={capture}
                                        multiple={label !== "Camera"}
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setAttachOpen(prev => !prev)}
                            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${attachOpen ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <GrAttachment size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                            {...register("content")}
                            onChange={(e) => { register("content").onChange(e); if (!editingMessage) handleTyping(); }}
                            className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!messageValue?.trim()}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 shrink-0"
                        >
                            <IoSend size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}