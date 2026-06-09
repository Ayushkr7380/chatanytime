import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGroupBioApi } from "@/api/chatApi";

export const useUpdateGroupBio = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGroupBioApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
    });
};