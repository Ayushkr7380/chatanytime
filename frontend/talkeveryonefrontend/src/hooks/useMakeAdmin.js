import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeAdminApi } from "@/api/chatApi";

export const useMakeAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: makeAdminApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
    });
};