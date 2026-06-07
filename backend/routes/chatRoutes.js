import { Router } from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { 
    myAllChats, 
    groupChat, 
    privateChat, 
    sendMessages, 
    getMessages, 
    markMessagesRead,
    leaveGroup,
    addMember,
    removeMember,
    makeAdmin,
    renameGroup,
    deleteChat,
    clearChat
} from "../controllers/chat.controllers.js";

const router = Router();

router.post("/chat/:id",isLoggedIn,privateChat);


router.post("/message",isLoggedIn,sendMessages);

router.get("/all-chats",isLoggedIn,myAllChats);
router.delete("/chat/:chatId/delete", isLoggedIn, deleteChat);
router.put("/chat/:chatId/clear", isLoggedIn, clearChat );

router.get("/message/:chatId",isLoggedIn,getMessages);
router.put("/message/read/:chatId", isLoggedIn, markMessagesRead);


// Group routes
router.post("/groupchat",isLoggedIn,groupChat);
router.put("/group/:chatId/leave", isLoggedIn, leaveGroup);
router.put("/group/:chatId/add-member", isLoggedIn, addMember);
router.put("/group/:chatId/remove-member", isLoggedIn, removeMember);
router.put("/group/:chatId/make-admin", isLoggedIn, makeAdmin);
router.put("/group/:chatId/rename", isLoggedIn, renameGroup);

export default router;
