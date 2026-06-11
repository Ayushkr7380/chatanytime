import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutSessionApi } from "@/api/sessionApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import socket from "@/websocket/Socket";

export const useLogoutSession = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: logoutSessionApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries(["sessions"]);
            if (data?.currentDevice) {
                socket.disconnect();
                queryClient.clear();
                navigate("/authentication");
            } else {
                toast.success("Device logged out.");
            }
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Logout failed"
            );
        },
    });
};