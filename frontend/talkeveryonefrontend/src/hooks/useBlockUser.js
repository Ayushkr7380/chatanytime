import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUserApi } from "@/api/userApi";

export const useBlockUser = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: blockUserApi,

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["block-status"]
            });

            queryClient.invalidateQueries({
                queryKey: ["chats"]
            });

        }
    });
};