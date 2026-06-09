import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadGroupPicApi } from "@/api/chatApi";

export const useUploadGroupPic = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadGroupPicApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        }
    });
};