import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messageApi";

export const useMessages = (chatId) => {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId),
    // staleTime: Infinity,
  });
};