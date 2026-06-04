import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupChat } from "@/api/chatApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useCreateGroup = (onSuccess) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: createGroupChat,
        onSuccess: (data) => {
            toast.success("Group created successfully!");
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            navigate(`/group/${data.chat._id}`);
            onSuccess?.(); 
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create group.");
        }
    });
};