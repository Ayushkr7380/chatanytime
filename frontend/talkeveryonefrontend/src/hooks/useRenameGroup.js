import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameGroupApi } from "@/api/chatApi";

export const useRenameGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: renameGroupApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
    });
};