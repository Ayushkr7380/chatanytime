import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMemberApi } from "@/api/chatApi";
import { toast } from "sonner";

export const useAddMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addMemberApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
         onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add member"
            );
        },
    });
};