import { useQuery } from "@tanstack/react-query";
import { getAllChats } from "@/api/chatApi";

export const useChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: getAllChats,
  });
};
