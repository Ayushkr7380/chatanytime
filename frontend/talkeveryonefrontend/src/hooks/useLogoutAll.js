import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutAllApi } from "@/api/sessionApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import socket from "@/websocket/Socket";

export const useLogoutAll = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: logoutAllApi,
        onSuccess: () => {
            socket.disconnect();
            queryClient.clear();
            navigate("/authentication");
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Logout failed"
            );
        },
    });
};