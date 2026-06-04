import { CreateSocketContext } from "./createSocketContext";
import socket from "../../websocket/Socket";
import { useQueryClient } from "@tanstack/react-query";

function SocketContext(props) {

    const queryClient = useQueryClient();

    function connectSocket(data) {
        if (!socket.connected) {
            socket.auth = data;
            socket.connect();

            // ← Global listener — connect hote hi lagao
            socket.on("newMessageNotification", ({ chatId }) => {
                console.log("New message notification:", chatId);
                queryClient.invalidateQueries({ queryKey: ["chats"] });
            });
        }
    }

    function joinAllChats(chatList) {
        if (!socket.connected) {
            console.log("socket not connected.");
            return;
        }
        chatList.forEach((chat) => {
            socket.emit("joinChat", chat._id);
        });
    }

    function sendMessageSocket(msgData) {
        socket.emit("sendMessage", msgData);
    }

    function startTyping(chatId) {
        socket.emit("typing", { chatId });
    }

    function stopTyping(chatId) {
        socket.emit("stopTyping", { chatId });
    }

    return (
        <CreateSocketContext.Provider value={{ connectSocket, sendMessageSocket, joinAllChats ,startTyping ,stopTyping}}>
            {props.children}
        </CreateSocketContext.Provider>
    );
}

export default SocketContext;