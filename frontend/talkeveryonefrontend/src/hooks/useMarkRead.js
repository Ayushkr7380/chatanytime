// src/hooks/useMarkRead.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markMessagesRead } from "@/api/chatApi";

export const useMarkRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (chatId) => markMessagesRead(chatId), // ← chatId yahan se aayega
        onSuccess: (_, chatId) => { // ← variables mein chatId milega
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
    });
};