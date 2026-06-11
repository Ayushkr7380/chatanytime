import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi } from "@/api/authApi";
import { toast } from "sonner";

export const useForgotPassword = () =>
    useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (data) => toast.success(data.message),
        onError: (error) => toast.error(error?.response?.data?.message || "Something went wrong"),
    });