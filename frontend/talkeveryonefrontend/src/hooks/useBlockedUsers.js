import { useQuery } from "@tanstack/react-query";
import { getBlockedUsersApi } from "@/api/userApi";

export const useBlockedUsers = () => {
    return useQuery({
        queryKey: ["blocked-users"],
        queryFn: getBlockedUsersApi,
    });
};