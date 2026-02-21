import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/users.model.js";

export const privateChat = async(req,res)=>{

    try {
        const { id } = req.user;

        const othersId = req.params.id;

        if(!othersId){
            return res.status(400).json({
                success:false,
                message:"UserId is required to start conversation."
            })
        }

        

        

        //prevent self chat

        if(id.toString() === othersId.toString()){
            return res.status(400).json({
                success:false,
                message:"You cannot chat with yourself."
            })
        }

        //check other user exists in DB 

        const otherUser = await User.findById(othersId).select("name -_id");

        const {name} = otherUser;

        if(!otherUser){
            return res.status(400).json({
                success:false,
                message:"User not found."
            })
        }

        //Check if the chat already exists

        const chat = await Chat.findOne({
            
            isGroupChat:false,
            users:{$all : [id , othersId]}
        }).populate("users","-password").populate("latestMessage")



        //if chat exists then return here
        if(chat){
            return res.status(200).json({
                success:true,
                message:"Chat already exists",
                chat
            })
        }

        //create new chat
        const newChat = await Chat.create({
            
            isGroupChat :false,
            users:[id , othersId]
        });

        if(!newChat){
            return res.status(400).json({
                success:false,
                message:"Failed to create new chat."
            })
        }

        const findChat = await Chat.findById(newChat._id).populate("users","-password");

        if(!findChat){
            return res.status(400).json({
                success:false,
                message:"Failed to load chat."
            })
        }

        res.status(200).json({
            success:true,
            message:"New chat created successfully.",
            chat : findChat
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

export const groupChat = async(req,res)=>{
    try {
        const { groupName , groupMembers } = req.body;
        if(!groupName || !groupMembers){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        if(groupMembers.length <2){
            return res.status(400).json({
                success:false,
                message:"Group chat needs at least 3 users"
            })
        }

        //add the logged-in user also
        groupMmebers.push(req.user.id);

        const groupChat = await Chat.create({
            chatName:groupName,
            isGroupChat: true,
            users:groupMembers,
            groupAdmin:req.user.id
        });

        if(!groupChat){
            return res.status(400).json({
                success:false,
                message:"Failed to create group."
            })
        }

        res.status(201).json({
            success:true,
            message:"Group created successfully.",
            groupChat
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

export const sendMessages = async(req,res)=>{
    try {
        const { content , chatId } = req.body;

        if(!content || !chatId){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        };


        let message = await Message.create({
            sender:req.user.id,
            content,
            chat:chatId,
            readBy:[req.user.id], //Sender already read it

        });

        if(!message){
            return res.status(400).json({
                success:false,
                message:"Failed to send message"
            })
        }

        message = await message.populate("sender", "username email");


        const latestMessage = await Chat.findByIdAndUpdate(chatId,{
            latestMessage:message._id,
        })
        
        console.log(latestMessage);
        

        return res.status(201).json({
            success:true,
            message:"Message send successfully",
            data:message
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })     
    }



}

export const myAllChats = async(req,res)=>{
    try {
        const chats = await Chat.find({
            users:{$in:[req.user.id]}
        }).populate("users" , "-password").populate("latestMessage");

        if(!chats){
            return res.status(400).json({
                success:false,
                message:"Failed to fetch chats."
            }); 
        }

        return res.status(200).json({
            success:true,
            message:"All chats fetched successfully.",
            chats
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

export const getMessages = async(req,res)=>{
    try {
        const  chatId  = req.params.chatId;

        console.log(chatId);
        

        const messages = await Message.find({chat : chatId}).populate("sender" , "email username name").populate({
            path:"chat",
            populate:[
                {
                    path:"users",
                    select:"username name email"
                },
                {
                    path:"latestMessage",
                    populate:{
                        path:"sender",
                        select:"name"
                    }
                    
                }
            ]
        });



        if(!messages){
            return res.status(400).json({
                success:false,
                message:"Failed to fetch the messages."
            })
        }

        return res.status(201).json({
            success:true,
            message:"Messages fetched successfully.",
            messages
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}