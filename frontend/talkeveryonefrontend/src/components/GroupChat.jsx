import { FaUsers } from "react-icons/fa";
import { useEffect, useRef, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrAttachment } from "react-icons/gr";
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
import { Image, FileText, Folder, Camera, Loader2, X } from "lucide-react"; 

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
    const [attachOpen, setAttachOpen] = useState(false);

    const [replyingTo, setReplyingTo] = useState(null);

    const imageRef = useRef(null);
    const pdfRef = useRef(null);
    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    const { mutate: deleteForMe, isPending: isDeletingForMe } = useDeleteMessageForMe(chatId);
    const { mutate: deleteForEveryone, isPending: isDeletingForEveryone } = useDeleteMessageForEveryone(chatId);
    const { mutate: editMessage, isPending: isEditing } = useEditMessage(chatId);

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
            prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
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

    const handleFileSelect = (files) => {
        if (!files?.length) return;

        sendMessage({
            files: Array.from(files),
            chatId,
            replyTo: replyingTo?._id
        });

        setReplyingTo(null);
        setAttachOpen(false);
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
                    const filtered = prev.filter(msg => !msg.optimistic);
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
                    msg._id === messageId ? { ...msg, content, isEdited } : msg
                )
            );
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        };

        socket.on("groupUpdated", ({ chatId: updatedChatId }) => {
            if (updatedChatId === chatId) queryClient.invalidateQueries({ queryKey: ["chats"] });
        });
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
            socket.off("groupUpdated");
        };
    }, [chatId, queryClient, meData?.user?._id, navigate, markRead]);

    const { register, handleSubmit, watch, reset, setValue } = useForm();
    const messageValue = watch("content");

    const onSubmit = ({ content }) => {
        if (editingMessage) {
            editMessage(
                { messageId: editingMessage.id, content },
                { onSuccess: () => { setEditingMessage(null); reset(); } }
            );
        } else {
            sendMessage({
                content,
                chatId,
                replyTo: replyingTo?._id
            });
            setReplyingTo(null);
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
                        <p className="text-sm text-slate-600 font-medium">{selectedMessages.length} selected</p>
                        {isPending ? (
                            <div className="flex items-center gap-2 px-2">
                                <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
                                <span className="text-xs text-slate-500 font-medium">Please wait...</span>
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(prev => !prev)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <BsThreeDotsVertical size={18} />
                                    </button>
                                    {menuOpen && (
                                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-100 w-44 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <button onClick={handleDeleteForMe} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                Delete for me
                                            </button>
                                            {allSelectedAreMine && !selectedMsg?.isDeleted && (
                                                <button onClick={handleDeleteForEveryone} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                    Delete for everyone
                                                </button>
                                            )}
                                            {isSingleSelected && allSelectedAreMine && !selectedMsg?.isDeleted && isSelectedMsgEditable && (
                                                <button onClick={handleEditStart} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                    Edit message
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setSelectedMessages([]); setMenuOpen(false); }}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-1 w-full">
                        <button onClick={() => navigate("/")} className="md:hidden p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0">
                            <IoArrowBack size={20} className="text-slate-700" />
                        </button>
                        <div onClick={() => navigate(`/group/${chatId}/info`)} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors min-w-0 flex-1">
                            {currentChat?.groupPic ? (
                                <img src={currentChat.groupPic} alt={groupName} className="h-10 w-10 rounded-full object-cover border-2 border-violet-200 shrink-0" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <FaUsers className="text-lg text-violet-600" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h2 className="font-semibold text-slate-800 text-sm truncate">{groupName}</h2>
                                <p className="text-xs text-slate-500">{membersCount} members</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Body container */}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 p-4 bg-slate-50 no-scrollbar overflow-y-auto">
                {messages?.map((msg) => {
                    const isSender = msg?.sender?._id === meData?.user?._id;
                    const senderUser = currentChat?.users?.find(u => u._id === msg?.sender?._id);
                    return (
                        <MessageBubble
                            key={msg._id}
                            messageId={msg._id}
                            text={msg.content}
                            messageType={msg.messageType}
                            fileName={msg.fileName}
                            isSender={isSender}
                            senderName={!isSender ? msg?.sender?.name : null}
                            senderPic={!isSender ? (senderUser?.privacy?.profilePic ? senderUser?.profilePic : null) : null}
                            time={new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                            isDeleted={msg.isDeleted}
                            isEdited={msg.isEdited}
                            isSelected={selectedMessages.includes(msg._id)}
                            onSelect={handleSelectMessage}
                            replyTo={msg.replyTo}
                            onReply={(id) => {
                                const msg = messages.find(m => m._id === id);
                                setReplyingTo(msg);
                            }}
                        />
                    );
                })}
                {otherTyping && <TypingBubble name={typerName} />}
                <div ref={bottomRef} />
            </div>

            {/* Reply Input Preview Bar */}
            {replyingTo && (
                <div className="flex items-center justify-between px-3 py-2 mx-3 mb-1 bg-violet-50 rounded-xl border border-violet-100 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-150">
                    <div className="border-l-2 border-violet-500 pl-2 min-w-0">
                        <p className="text-[11px] text-violet-600 font-semibold">{replyingTo.sender?.name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            {replyingTo.messageType === "image" ? (
                                <><Camera size={12} className="text-slate-400" /> Photo</>
                            ) : replyingTo.messageType === "pdf" ? (
                                <><FileText size={12} className="text-slate-400" /> PDF</>
                            ) : replyingTo.messageType === "file" ? (
                                <><Folder size={12} className="text-slate-400" /> File</>
                            ) : (
                                replyingTo.content
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-violet-100 rounded-lg"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Form Input Deck */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {editingMessage && (
                    <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-violet-50 rounded-xl border border-violet-100">
                        <p className="text-xs text-violet-600 font-medium">Editing message</p>
                        <button onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                    </div>
                )}

                {attachOpen && (
                    <div className="flex gap-2 mb-3 px-1 animate-in slide-in-from-bottom-2 duration-200">
                        {[
                            { ref: imageRef, accept: "image/*", label: "Image", bg: "bg-violet-50 text-violet-600", icon: <Image size={18} /> },
                            { ref: pdfRef, accept: "application/pdf", label: "PDF", bg: "bg-red-50 text-red-500", icon: <FileText size={18} /> },
                            { ref: fileRef, accept: "*", label: "File", bg: "bg-blue-50 text-blue-500", icon: <Folder size={18} /> },
                            { ref: cameraRef, accept: "image/*", capture: "environment", label: "Camera", bg: "bg-green-50 text-green-600", icon: <Camera size={18} /> },
                        ].map(({ ref, accept, capture, label, bg, icon }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => ref.current?.click()}
                                className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-transform active:scale-95 ${bg}`}
                            >
                                <div className="h-9 w-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                                    {icon}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{label}</span>
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
                        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${attachOpen ? "bg-violet-100 text-violet-600 rotate-45" : "text-slate-400 hover:text-slate-600 bg-slate-50"}`}
                    >
                        <GrAttachment size={16} />
                    </button>
                    <input
                        type="text"
                        autoComplete="off"
                        placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                        {...register("content")}
                        onChange={(e) => { register("content").onChange(e); if (!editingMessage) handleTyping(); }}
                        className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!messageValue?.trim()}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-all active:scale-95 shrink-0 shadow-sm shadow-violet-100"
                    >
                        <IoSend size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}