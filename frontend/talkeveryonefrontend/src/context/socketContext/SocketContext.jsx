// import { useEffect } from "react";
import { CreateSocketContext } from "./createSocketContext";
import socket from "../../websocket/Socket";



function SocketContext(props){

    
    
    // useEffect(()=>{
    //     socket.connect(); //connect once

    //     // socket.on("newUser",(newuserid)=>{
    //     //     console.log("New user connected with id : ",newuserid);
    //     // });


    //     return ()=>{
    //         socket.disconnect();
    //     }
    // },[])

    function connectSocket(data){
        if(!socket.connected){
            console.log("Check ",data);
            
            socket.auth=data;
            socket.connect();
        }
    }

    function joinAllChats(chatList){
        if(!socket.connected){
            console.log("socket not connected.");
            return;
        }

        chatList.forEach((chat) => {
        socket.emit("joinChat", chat._id);
        });
    }

    function sendMessageSocket(msgData){
        console.log("Message which is going to backend : ",msgData);

        socket.emit("sendMessage",msgData);
    }

   

    return(
        <>
            <CreateSocketContext.Provider value={{connectSocket,sendMessageSocket,joinAllChats}}>
                {props.children}
            </CreateSocketContext.Provider>

        </>
    )
}

export default SocketContext;