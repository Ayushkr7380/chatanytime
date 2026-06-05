import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageApi } from "@/api/messageApi";

import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import { toast } from "sonner";
// import { useContext } from "react";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  // const { sendMessageSocket } = useContext(CreateSocketContext);

  return useMutation({

    mutationFn: sendMessageApi,
    onSuccess: () => {

      queryClient.invalidateQueries(["chats"]);
    },

    onError: (error) => {
      console.log("Error:", error);
      toast.error("Failed to send message.");
    }
  });
};