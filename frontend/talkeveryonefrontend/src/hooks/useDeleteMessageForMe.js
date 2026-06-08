import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessageForMeApi } from "@/api/messageApi";

export const useDeleteMessageForMe = (chatId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMessageForMeApi,
        onSuccess: (_, messageId) => {
            queryClient.setQueryData(["messages", chatId], (prev = []) =>
                prev.filter(msg => msg._id !== messageId)
            );
        }
    });
};