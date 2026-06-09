import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfilePicApi } from "@/api/userApi";

export const useUploadProfilePic = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadProfilePicApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        }
    });
};