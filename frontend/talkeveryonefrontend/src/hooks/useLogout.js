import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutApi } from "@/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import socket from "@/websocket/Socket";

export const useLogout = () => {

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    return useMutation({

        mutationFn: logoutApi,

        onSuccess: () => {

            socket.disconnect();

            queryClient.clear();

            toast.success("Logged out");

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