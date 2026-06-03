import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useContext } from "react";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";

export const useLogin = () => {

    const navigate = useNavigate();
    const { connectSocket } = useContext(CreateSocketContext);

    return useMutation({
        mutationFn: loginApi,

        onSuccess: (data) => {

            connectSocket({
                userId: data.user._id,
                name: data.user.name,
            });

            toast.success("User Logged In");

            navigate("/");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Login Failed"
            );
        },
    });
};