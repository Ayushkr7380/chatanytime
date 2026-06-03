import { FaUserCircle } from "react-icons/fa";
import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoArrowBack, IoSend } from "react-icons/io5";
import socket from "@/websocket/Socket";
import { useMessages } from "@/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";

export default function Chat() {
    const navigate = useNavigate();
    const { chatId } = useParams();

    const location = useLocation();
    const createdChat = location.state?.chat;

    const { data: meData } = useMe();

    const queryClient = useQueryClient();

    const { data: messages = [], isLoading } = useMessages(chatId);

    const { mutate: sendMessage } = useSendMessage();

    useEffect(() => {
        const joinRoom = () => {
            socket.emit("joinChat", chatId);
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on("connect", joinRoom);

        const handleReceiveMessage = (msgData) => {
            if (msgData.chatId === chatId) {
                queryClient.setQueryData(["messages", chatId], (prev) => [
                    ...(prev || []),
                    msgData,
                ]);
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [chatId, queryClient]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
    } = useForm();

    const messageValue = watch("content");

    const onSubmit = ({ content }) => {
        sendMessage({
            content,
            chatId,
        });

        reset();
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className={`flex ${
                            i % 2 === 0
                                ? "justify-start"
                                : "justify-end"
                        }`}
                    >
                        <Skeleton className="h-12 w-52 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    const otherUserName =
        messages?.length > 0
            ? messages[0]?.chat?.users?.find(
                  (u) => u?._id !== meData?.user?._id
              )?.name
            : createdChat?.users?.find(
                  (u) => u?._id !== meData?.user?._id
              )?.name;

    return (
        <div className="w-full h-screen flex flex-col bg-slate-50">

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4">

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate("/")}
                        className="
                            md:hidden
                            p-1
                            rounded-lg
                            hover:bg-slate-100
                        "
                    >
                        <IoArrowBack size={20} />
                    </button>
                    <FaUserCircle className="text-4xl text-violet-600" />

                    <div>
                        <h2 className="font-semibold text-slate-800">
                            {otherUserName}
                        </h2>

                        <p className="text-xs text-green-500">
                            Online
                        </p>
                    </div>
                </div>

            </div>

            {/* Messages */}
            <div
                className="
                    flex-1
                    overflow-y-auto
                    no-scrollbar
                    p-4
                    bg-slate-50
                "
            >
                {messages?.map((msg) => (
                    <MessageBubble
                        key={msg._id}
                        text={msg.content}
                        isSender={
                            msg?.sender?._id === meData?.user?._id
                        }
                        time={new Date(
                            msg.createdAt
                        ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    />
                ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200">

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
                        className="
                            flex-1
                            border
                            border-slate-200
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:border-violet-500
                            bg-slate-50
                        "
                    />

                    <button
                        type="submit"
                        disabled={
                            !messageValue ||
                            messageValue.trim() === ""
                        }
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
                            transition
                            disabled:opacity-50
                        "
                    >
                        <IoSend />
                    </button>

                </form>

            </div>

        </div>
    );
}