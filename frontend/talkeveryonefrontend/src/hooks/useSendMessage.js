import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageApi } from "@/api/messageApi";
import { useMe } from "./useMe";


export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { data: meData } = useMe();

  return useMutation({
    mutationFn: sendMessageApi,

    onMutate: async ({ content, chatId }) => {
      const previousMessages =
        queryClient.getQueryData(["messages", chatId]);

      queryClient.setQueryData(
        ["messages", chatId],
        (old = []) => [
          ...old,
          {
            _id: `temp-${Date.now()}`,
            content,
            sender: {
              _id: meData?.user?._id,
            },
            createdAt: new Date().toISOString(),
            readBy: [],
            optimistic: true,
          },
        ]
      );

      return { previousMessages };
    },

    onError: (err, vars, ctx) => {
      queryClient.setQueryData(
        ["messages", vars.chatId],
        ctx.previousMessages
      );
    },
  });
};