import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendMessageApi } from "@/api/messageApi";
import { getUserById } from "@/api/userApi";

export default function NewChat() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: otherUser } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => getUserById(userId),
    });

    const { register, handleSubmit, watch, reset } = useForm();
    const messageValue = watch("content");

    const { mutate: sendMessage } = useMutation({
        mutationFn: sendMessageApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            // data.data — backend "data" field mein message return karta hai
            navigate(`/chat/${data.data.chat}`, { replace: true });
        }
    });

    const onSubmit = ({ content }) => {
        sendMessage({ content, receiverId: userId });
        reset();
    };

    return (
        <div className="w-full flex flex-col bg-slate-50" style={{ height: '100svh' }}>

            {/* Header — Chat.jsx jaisa */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <div className="flex items-center gap-1">

                    {/* back button — mobile only */}
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

                    <div className="flex items-center gap-3 px-2 py-1.5 min-w-0">
                        <FaUserCircle className="text-4xl text-violet-500 shrink-0" />
                        <div className="min-w-0">
                            <h2 className="font-semibold text-slate-800 text-sm truncate">
                                {otherUser?.name || "..."}
                            </h2>
                            <p className="text-xs text-slate-400">
                                Send a message to start chatting
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                No messages yet. Say hi! 👋
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        placeholder="Type a message..."
                        {...register("content", { required: true })}
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
        </div>
    );
}