import { useMutation } from "@tanstack/react-query";
import { registerApi } from "@/api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useContext } from "react";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";

export const useRegister = () => {

    const navigate = useNavigate();
    const { connectSocket } = useContext(CreateSocketContext);

    return useMutation({
        mutationFn: registerApi,

        onSuccess: (data) => {

            connectSocket({
                userId: data.user._id,
                name: data.user.name,
            });

            toast.success("User Registered");

            navigate("/");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Registration Failed"
            );
        },
    });
};