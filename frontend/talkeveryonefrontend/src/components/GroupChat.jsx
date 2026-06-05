import { FaUsers } from "react-icons/fa";
import { useEffect, useRef, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoArrowBack, IoSend } from "react-icons/io5";
import socket from "@/websocket/Socket";
import { useMessages } from "@/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useMe } from "@/hooks/useMe";
import { useMarkRead } from "@/hooks/useMarkRead";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import { TypingBubble } from "./TypingBubble";
import Skeleton from "@/components/Skeleton";

export default function GroupChat() {

    const bottomRef = useRef(null);
    const navigate = useNavigate();
    const { chatId } = useParams();

    const { data: meData } = useMe();
    const queryClient = useQueryClient();

    const { data: messages = [], isLoading } = useMessages(chatId);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markRead } = useMarkRead();
    const { startTyping, stopTyping } = useContext(CreateSocketContext);

    const [otherTyping, setOtherTyping] = useState(false);
    const [typerName, setTyperName] = useState("");
    const typingTimeoutRef = useRef(null);

    // Group info
    const groupName = messages?.[0]?.chat?.chatName;
    const membersCount = messages?.[0]?.chat?.users?.length;

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
                queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
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
        socket.on(
            "typing",
            ({
                chatId: typingChatId,
                userId: typingUserId,
                name
            }) => {

                if (typingChatId !== chatId)
                    return;

                if (
                    typingUserId ===
                    meData?.user?._id
                )
                    return;

                setOtherTyping(true);

                setTyperName(
                    name || "Someone"
                );
            }
        );
        socket.on(
            "stopTyping",
            ({
                chatId: typingChatId
            }) => {

                if (
                    typingChatId !== chatId
                )
                    return;

                setOtherTyping(false);

                setTyperName("");
            }
        );

        socket.on(
            "removedFromGroup",
            ({ chatId: removedChatId }) => {

                if (
                    removedChatId === chatId
                ) {

                    navigate("/");

                }

                queryClient.invalidateQueries({
                    queryKey: ["chats"]
                });

            }
        );

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("messagesRead", handleMessagesRead);
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("removedFromGroup");
        };
    }, [chatId, queryClient, meData?.user?._id,
    navigate , markRead]);

    const { register, handleSubmit, watch, reset } = useForm();
    const messageValue = watch("content");

    const handleTyping = () => {
        startTyping(chatId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(chatId);
        }, 2000);
    };

    const onSubmit = ({ content }) => {
        sendMessage({ content, chatId });
        reset();
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 w-full h-screen">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <Skeleton className="h-12 w-52 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50">

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="md:hidden p-1 rounded-lg hover:bg-slate-100"
                    >
                        <IoArrowBack size={20} />
                    </button>
                    {/* CLICKABLE HEADER */}
                    <div
                        onClick={() =>
                            navigate(`/group/${chatId}/info`)
                        }
                        className="
                            flex
                            items-center
                            gap-3
                            cursor-pointer
                            flex-1
                        "
                    >
                        <FaUsers className="text-4xl text-violet-600" />

                        <div>
                            <h2 className="font-semibold text-slate-800">
                                {groupName}
                            </h2>

                            <p className="text-xs text-slate-500">
                                {membersCount} members
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 bg-slate-50">
                {messages?.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        text={msg.content}
                        messageType={msg.messageType}
                        isSender={
                            msg?.sender?._id === meData?.user?._id
                        }
                        senderName={
                            msg?.sender?._id !== meData?.user?._id
                                ? msg?.sender?.name
                                : null
                        }
                        time={new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    />
                ))}
                {otherTyping && (
                    <TypingBubble
                        name={typerName}
                    />
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        {...register("content", { required: "message is required" })}
                        onChange={(e) => {
                            register("content").onChange(e);
                            handleTyping();
                        }}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500 bg-slate-50"
                    />
                    <button
                        type="submit"
                        disabled={!messageValue || messageValue.trim() === ""}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50"
                    >
                        <IoSend />
                    </button>
                </form>
            </div>

        </div>
    );
}