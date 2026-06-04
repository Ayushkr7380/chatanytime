import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMemberApi } from "@/api/chatApi";

export const useAddMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addMemberApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
    });
};