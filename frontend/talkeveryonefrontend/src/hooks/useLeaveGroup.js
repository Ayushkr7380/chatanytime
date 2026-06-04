import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveGroupApi } from "@/api/chatApi";

export const useLeaveGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: leaveGroupApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
    });
};