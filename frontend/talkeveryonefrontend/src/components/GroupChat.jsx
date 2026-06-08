import { FaUsers } from "react-icons/fa";
import { useEffect, useRef, useContext, useState } from "react";
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
import { useMarkRead } from "@/hooks/useMarkRead";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import { TypingBubble } from "./TypingBubble";
import Skeleton from "@/components/Skeleton";
import { useChats } from "@/hooks/useChats";
import { useDeleteMessageForMe } from "@/hooks/useDeleteMessageForMe";
import { useDeleteMessageForEveryone } from "@/hooks/useDeleteMessageForEveryone";
import { useEditMessage } from "@/hooks/useEditMessage";

export default function GroupChat() {

    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const navigate = useNavigate();
    const { chatId } = useParams();

    const { data: meData } = useMe();
    const queryClient = useQueryClient();
    const { data: chats = [] } = useChats();

    const currentChat = chats.find(c => c._id === chatId);
    const groupName = currentChat?.chatName;
    const membersCount = currentChat?.users?.length;

    const { data: messages = [], isLoading } = useMessages(chatId);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markRead } = useMarkRead();
    const { startTyping, stopTyping } = useContext(CreateSocketContext);

    const [otherTyping, setOtherTyping] = useState(false);
    const [typerName, setTyperName] = useState("");
    const typingTimeoutRef = useRef(null);

    const [selectedMessages, setSelectedMessages] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);

    const { mutate: deleteForMe, isPending: isDeletingForMe } = useDeleteMessageForMe(chatId);
    const { mutate: deleteForEveryone, isPending: isDeletingForEveryone } = useDeleteMessageForEveryone(chatId);
    const { mutate: editMessage, isPending: isEditing } = useEditMessage(chatId);

    const isPending = isDeletingForMe || isDeletingForEveryone || isEditing;

    const allSelectedAreMine = selectedMessages.every(id => {
        const msg = messages.find(m => m._id === id);
        return msg?.sender?._id === meData?.user?._id;
    });

    const isSingleSelected = selectedMessages.length === 1;
    const selectedMsg = isSingleSelected
        ? messages.find(m => m._id === selectedMessages[0])
        : null;

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
        const entry = chat?.deletedFor?.find(
            d => d.userId.toString() === meData?.user?._id.toString()
        );

        const hasDeleted = entry && !entry.isCleared;

        if (hasDeleted) {
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
                    const filtered = prev.filter(msg =>
                        !(msg.optimistic && msg.content === msgData.content && msg.sender?._id === msgData.sender?._id)
                    );
                    return [...filtered, msgData];
                });
                markRead(chatId);
            }
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        };

        const handleMessagesRead = ({ chatId: readChatId, userId: readerUserId }) => {
            if (readChatId === chatId) {
                queryClient.setQueryData(["messages", chatId], (prev = []) =>
                    prev.map(msg => ({
                        ...msg,
                        readBy: msg.readBy?.includes(readerUserId)
                            ? msg.readBy
                            : [...(msg.readBy || []), readerUserId]
                    }))
                );
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
        };

        const handleMessageUpdated = ({ messageId, content, isEdited }) => {
            queryClient.setQueryData(["messages", chatId], (prev = []) =>
                prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, content, isEdited }
                        : msg
                )
            );
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("messagesRead", handleMessagesRead);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("typing", ({ chatId: typingChatId, userId: typingUserId, name }) => {
            if (typingChatId !== chatId) return;
            if (typingUserId === meData?.user?._id) return;
            setOtherTyping(true);
            setTyperName(name || "Someone");
        });
        socket.on("stopTyping", ({ chatId: typingChatId }) => {
            if (typingChatId !== chatId) return;
            setOtherTyping(false);
            setTyperName("");
        });
        socket.on("removedFromGroup", ({ chatId: removedChatId }) => {
            if (removedChatId === chatId) navigate("/");
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        });

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messagesRead", handleMessagesRead);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("removedFromGroup");
        };
    }, [chatId, queryClient, meData?.user?._id, navigate, markRead]);

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
        <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                {selectedMessages.length > 0 ? (
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
                                            {allSelectedAreMine && !selectedMsg?.isDeleted &&(
                                                <button
                                                    onClick={handleDeleteForEveryone}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    Delete for everyone
                                                </button>
                                            )}
                                            {isSingleSelected && allSelectedAreMine && !selectedMsg?.isDeleted && (
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
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate("/")}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                        >
                            <IoArrowBack size={20} className="text-slate-700" />
                        </button>

                        <div
                            onClick={() => navigate(`/group/${chatId}/info`)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors min-w-0"
                        >
                            <FaUsers className="text-4xl text-violet-600 shrink-0" />
                            <div className="min-w-0">
                                <h2 className="font-semibold text-slate-800 text-sm truncate">
                                    {groupName}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {membersCount} members
                                </p>
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
                        messageType={msg.messageType}
                        isSender={msg?.sender?._id === meData?.user?._id}
                        senderName={msg?.sender?._id !== meData?.user?._id ? msg?.sender?.name : null}
                        time={new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}
                        isDeleted={msg.isDeleted}
                        isEdited={msg.isEdited}
                        isSelected={selectedMessages.includes(msg._id)}
                        onSelect={handleSelectMessage}
                    />
                ))}
                {otherTyping && <TypingBubble name={typerName} />}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {editingMessage && (
                    <div className="flex items-center justify-between px-2 py-1 mb-2 bg-violet-50 rounded-xl border border-violet-200">
                        <p className="text-xs text-violet-600">Editing message</p>
                        <button
                            onClick={handleCancelEdit}
                            className="text-xs text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                        {...register("content", { required: "message is required" })}
                        onChange={(e) => {
                            register("content").onChange(e);
                            if (!editingMessage) handleTyping();
                        }}
                        className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!messageValue || messageValue.trim() === ""}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 transition-colors disabled:opacity-40 shrink-0"
                    >
                        <IoSend size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}