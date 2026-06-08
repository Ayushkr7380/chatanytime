import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessageApi } from "@/api/messageApi";

export const useEditMessage = (chatId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: editMessageApi,

        onSuccess: (response) => {
             const updatedMessage = response.data; 
            queryClient.setQueryData(
                ["messages", chatId],
                (prev = []) =>
                    prev.map(msg =>
                        msg._id === updatedMessage._id
                            ? {
                                ...msg,
                                content: updatedMessage.content,
                                isEdited: true
                            }
                            : msg
                    )
            );
        }
    });
};