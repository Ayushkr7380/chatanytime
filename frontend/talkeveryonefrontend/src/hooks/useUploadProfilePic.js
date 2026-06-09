import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfilePicApi } from "@/api/userApi";
import { toast } from "sonner";

export const useUploadProfilePic = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadProfilePicApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Profile picture updated.")
        }
    });
};