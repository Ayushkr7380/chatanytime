import { useQuery } from "@tanstack/react-query";
import { getSessionsApi } from "@/api/sessionApi";

export const useSessions = () =>
    useQuery({
        queryKey: ["sessions"],
        queryFn: getSessionsApi,
    });