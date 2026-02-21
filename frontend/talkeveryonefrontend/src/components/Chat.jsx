import { FaUserCircle } from "react-icons/fa";
import { Input } from "./ui/input";
import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { CreateUserContext } from "@/context/userContext/CreateUserContext";
import { MessageBubble } from "./MessageBubble";
import { useForm } from "react-hook-form";
import { IoSend } from "react-icons/io5";
import socket from "@/websocket/Socket";
export default function Chat(){

    const { chatId } = useParams();
    const userContext = useContext(CreateUserContext);
    const { fetchMessages ,messages,userData ,sendMessage ,newChat ,setMessages } = userContext;

    

    useEffect(()=>{
        console.log("Opened Chat ID:", chatId);
        fetchMessages(chatId);
    },[chatId])


     //Listen message from backend
    useEffect(()=>{
       
        socket.on("receiveMessage",(msgData)=>{
            //Only add messages of current chat
            if (msgData.chatId === chatId) {
                setMessages((prev) => [...prev, msgData]);
            }
        })

        return ()=>{
            socket.off("receiveMessage");
        }
    },[chatId])

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
      } = useForm()
    
      const messageValue = watch("content");

      const onSubmit = ({content}) => {
          sendMessage({content,chatId})
          reset();
    }

    console.log("M : ",messages);
    console.log("U : ",userData);
    console.log("N : ",newChat);
    
    
    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="h-[10vh]  flex items-center">
                    <div className="font-bold flex items-center px-2 mx-1">
                        <FaUserCircle className="text-3xl"/>
                        <p className="mx-3">{messages?.length > 0 ? messages[0]?.chat?.users?.find((u)=>u?._id !== userData?.user?._id)?.name : newChat?.users?.find((u)=>u?._id !== userData?.user?._id)?.name}</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-gray-300 justify-between">
                    <div className="flex-1 overflow-y-auto p-3">
                        {messages && messages.map(( msg )=>(
                            <MessageBubble
                                key={msg._id}
                                text={msg.content}
                                isSender={msg?.sender?._id === userData?.user?._id}
                                time = {new Date(msg.createdAt).toLocaleTimeString([],{
                                    hour:"numeric",
                                    minute:"2-digit",
                                    hour12:true,
                                })}
                            />
                        ))}
                    </div>

                    <div className="bottom  p-1">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex">

        
                            <div className="w-[95%]">

            
                                <input
                                type="text" 
                                placeholder="Enter a message"
                                {...register("content" , {required:"message is required"})}
                                className="w-full border rounded-l-lg  p-2 mt-1 bg-gray-400 cursor-pointer "
                                />

                                {errors.content && (
                                    <p className="text-red-500 text-sm">{errors.content.message}</p>
                                )}
                            </div>

     
                            <button
                                type="submit"
                                disabled={!messageValue || messageValue.trim() === ""}
                                className="w-[5%] flex items-center justify-center text-xl bg-black text-center text-white p-2 mt-1 rounded-r-lg cursor-pointer hover:bg-orange-600 transition"
                                >
                                <IoSend/>
                            </button>

      
                        </form>
                        
                    </div>
                </div>
            </div>
        </>
    )
}