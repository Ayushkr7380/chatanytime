import { useQuery } from "@tanstack/react-query";
import { getUserStatus } from "@/api/userApi";

export const useUserStatus = (userId) => {
    return useQuery({
        queryKey: ["status", userId],
        queryFn: () => getUserStatus(userId),
        enabled: !!userId, 
        refetchInterval: 30000, 
    });
};