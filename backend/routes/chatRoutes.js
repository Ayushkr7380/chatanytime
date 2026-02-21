import { Router } from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { myAllChats, groupChat, privateChat, sendMessages, getMessages } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/chat/:id",isLoggedIn,privateChat);
router.post("/groupchat",isLoggedIn,groupChat);

router.post("/message",isLoggedIn,sendMessages);

router.get("/all-chats",isLoggedIn,myAllChats);

router.get("/message/:chatId",isLoggedIn,getMessages);

export default router;
