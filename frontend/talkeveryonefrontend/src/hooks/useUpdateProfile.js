import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileApi } from "@/api/userApi";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfileApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        }
    });
};