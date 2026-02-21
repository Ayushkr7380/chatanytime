import {config} from "dotenv";
config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "http";
import {Server } from "socket.io";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

const app = express();
const server = createServer(app);


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"));
app.use(cookieParser());

const corsOption = {
    origin : process.env.FRONTEND_URL,
    credentials:true,
    optionsSuccessStatus:200,

}

app.use(cors(corsOption));

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
});



// io.on("connection",(socket)=>{
//     console.log("A new user connected with user id : ",socket.id);

//     io.emit("newUser",socket.id);

//     // socket.on("chatting",({senderId,text,timestamp})=>{
//     //     io.emit("chatting",{senderId,text,timestamp}); 
//     // }) OR


//     socket.on("chatting",({text, timestamp })=>{
//         io.emit("chatting",{senderId:socket.id, 
//         text,
//         timestamp}); 
//     })
    
    
// });



io.on("connection",(socket)=>{
    console.log("A new user connected with socket id : ",socket.handshake.auth?.name);

    //join chat room
    socket.on("joinChat",(chatId)=>{
        socket.join(chatId);
        console.log("Room joined.")
    })

    //Listen message from frontend
    socket.on("sendMessage",(msgInfo)=>{
        console.log("Message received from frontend:", msgInfo);

        // //send to all users
        // io.emit("receiveMessage",data);

        console.log("socketroomid : ",msgInfo.chatId);
        //send only to particular room
        io.to(msgInfo.chatId).emit("receiveMessage", {
            _id: Date.now(), // temporary id
            content: msgInfo.content,
            chatId: msgInfo.chatId,
            sender: {
            _id: socket.handshake.auth.userId,
            },
            createdAt: new Date(),
        });
    })
})

app.use("/auth",userRouter);
app.use("/user",chatRouter);

export default server;