import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "@/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: () => {
            toast.success("Password reset successfully!");
            navigate("/authentication");
        },
        onError: (error) => toast.error(error?.response?.data?.message || "Something went wrong"),
    });
};