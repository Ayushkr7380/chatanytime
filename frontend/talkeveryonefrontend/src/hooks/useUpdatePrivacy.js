import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePrivacyApi } from "@/api/userApi";

export const useUpdatePrivacy = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePrivacyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        }
    });
};