// src/hooks/useMarkRead.js
import { useMutation} from "@tanstack/react-query";
import { markMessagesRead } from "@/api/chatApi";

export const useMarkRead = () => {

    return useMutation({
        mutationFn: (chatId) =>
            markMessagesRead(chatId)
    });

};