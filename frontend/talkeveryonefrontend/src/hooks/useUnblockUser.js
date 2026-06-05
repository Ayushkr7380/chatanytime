import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unblockUserApi } from "@/api/userApi";

export const useUnblockUser = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unblockUserApi,

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["block-status"]
            });

            queryClient.invalidateQueries({
                queryKey: ["chats"]
            });
            
            queryClient.invalidateQueries({
                queryKey: ["status"]
            });
        }
    });
};