import { useQuery } from "@tanstack/react-query";
import { getBlockStatusApi } from "@/api/userApi";

export const useBlockStatus = (userId) => {

    return useQuery({
        queryKey: ["block-status", userId],

        queryFn: () =>
            getBlockStatusApi(userId),

        enabled: !!userId,
    });

};