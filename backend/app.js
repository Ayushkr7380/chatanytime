import { config } from "dotenv";
config();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import { Chat } from "./models/chat.model.js";
import { User } from "./models/users.model.js";

const app = express();
const server = createServer(app);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

const corsOption = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,

}

app.use(cors(corsOption));

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
});


io.on("connection", async (socket) => {
    const userId = socket.handshake.auth?.userId;

    console.log("A new user connected:", socket.handshake.auth?.name);


    if (userId) {
        socket.join(userId);
        console.log("User personal room joined:", userId);

        await User.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: null
        });

        io.emit("userStatusUpdate", {
            userId,
            isOnline: true,
            lastSeen: null
        });
    }


    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log("Room joined:", chatId);
    });

    socket.on("disconnect", async () => {
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });
            console.log("User disconnected:", userId);
        }

        io.emit("userStatusUpdate", {
            userId,
            isOnline: false,
            lastSeen: new Date()
        });

        console.log("User disconnected:", userId);
    });


    socket.on("typing", async ({ chatId }) => {

        const user = await User.findById(userId)
            .select("name");

        socket.to(chatId).emit(
            "typing",
            {
                chatId,
                userId,
                name: user?.name
            }
        );
    });

    socket.on("stopTyping", ({ chatId }) => {
        socket.to(chatId).emit("stopTyping", { chatId });
    });
});

app.use("/auth", userRouter);
app.use("/user", chatRouter);

export { io };
export default server;