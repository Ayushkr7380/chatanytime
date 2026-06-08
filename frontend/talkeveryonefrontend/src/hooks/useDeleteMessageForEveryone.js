import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessageForEveryoneApi } from "@/api/messageApi";

export const useDeleteMessageForEveryone = (chatId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMessageForEveryoneApi,

        onSuccess: (_, messageId) => {
            queryClient.setQueryData(
                ["messages", chatId],
                (prev = []) =>
                    prev.map(msg =>
                        msg._id === messageId
                            ? {
                                ...msg,
                                isDeleted: true,
                                content: "This message was deleted"
                            }
                            : msg
                    )
            );
        }
    });
};