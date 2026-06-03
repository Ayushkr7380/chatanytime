import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChatApi } from "@/api/chatApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCreateChat = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createChatApi,

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });

            navigate(`/chat/${data.chat._id}`, {
                state: {
                    chat: data.chat,
                },
            });
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message ||
                "Failed to create chat"
            );
        },
    });
};