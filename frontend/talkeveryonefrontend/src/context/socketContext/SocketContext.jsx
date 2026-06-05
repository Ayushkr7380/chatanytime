import { CreateSocketContext } from "./CreateSocketContext";
import socket from "../../websocket/Socket";
import { useQueryClient } from "@tanstack/react-query";

function SocketContext(props) {

    const queryClient = useQueryClient();

    function connectSocket(data) {

        if (!socket.connected) {

            socket.auth = data;
            socket.connect();

            // New Message
            socket.on(
                "newMessageNotification",
                ({ chatId }) => {

                    console.log(
                        "New message notification:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                }
            );

            // Added To Group
            socket.on(
                "addedToGroup",
                ({ chatId }) => {

                    console.log(
                        "Added to group:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["messages", chatId]
                    });

                }
            );

            // Removed From Group
            socket.on(
                "removedFromGroup",
                ({ chatId }) => {

                    console.log(
                        "Removed from group:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["messages", chatId]
                    });


                }
            );

            // Group Renamed
            socket.on(
                "groupRenamed",
                ({ chatId }) => {

                    console.log(
                        "Group renamed:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["messages", chatId]
                    });


                }
            );

            // Member Left
            socket.on(
                "memberLeft",
                ({ chatId }) => {

                    console.log(
                        "Member left:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["messages", chatId]
                    });


                }
            );

            // Admin Changed
            socket.on(
                "adminChanged",
                ({ chatId }) => {

                    console.log(
                        "Admin changed:",
                        chatId
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["chats"]
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["messages", chatId]
                    });


                }
            );

        }

        // Member Added
        socket.on(
            "memberAdded",
            ({ chatId }) => {

                console.log(
                    "Member added:",
                    chatId
                );

                queryClient.invalidateQueries({
                    queryKey: ["chats"]
                });

                queryClient.invalidateQueries({
                    queryKey: ["messages", chatId]
                });

            }
        );

        // Member Removed
        socket.on(
            "memberRemoved",
            ({ chatId }) => {

                console.log(
                    "Member removed:",
                    chatId
                );

                queryClient.invalidateQueries({
                    queryKey: ["chats"]
                });

                queryClient.invalidateQueries({
                    queryKey: ["messages", chatId]
                });

            }
        );

    }

    function joinAllChats(chatList) {

        if (!socket.connected) {

            console.log(
                "socket not connected."
            );

            return;
        }

        chatList.forEach((chat) => {

            socket.emit(
                "joinChat",
                chat._id
            );

        });

    }

    // function sendMessageSocket(msgData) {

    //     socket.emit(
    //         "sendMessage",
    //         msgData
    //     );

    // }

    function startTyping(chatId) {

        socket.emit(
            "typing",
            { chatId }
        );

    }

    function stopTyping(chatId) {

        socket.emit(
            "stopTyping",
            { chatId }
        );

    }

    return (
        <CreateSocketContext.Provider
            value={{
                connectSocket,
                // sendMessageSocket,
                joinAllChats,
                startTyping,
                stopTyping,
            }}
        >
            {props.children}
        </CreateSocketContext.Provider>
    );
}

export default SocketContext;