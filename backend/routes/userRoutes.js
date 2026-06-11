import { Router } from "express";
import { loginUser, logoutUser, registerUser, searchUser , getUserData, getUserStatus, blockUser, unblockUser, getBlockStatus, getUserById, updateProfile, uploadProfilePic, getBlockedUsers, updatePrivacy, getActiveSessions, logoutAll, logoutParticularDevice} from "../controllers/user.controllers.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.post("/registerUser",registerUser);
router.post("/loginUser",loginUser);


router.post("/logoutUser",isLoggedIn,logoutUser);
router.get("/sessions", isLoggedIn, getActiveSessions);
router.delete("/sessions/all", isLoggedIn, logoutAll);
router.delete("/sessions/:sessionId", isLoggedIn, logoutParticularDevice);



router.get("/searchUser",isLoggedIn,searchUser);


router.get('/me',isLoggedIn,getUserData);

router.get("/status/:userId", isLoggedIn, getUserStatus);
router.put( "/block/:userId",isLoggedIn,blockUser);

router.put("/unblock/:userId",isLoggedIn,unblockUser);

router.get("/block-status/:userId",isLoggedIn,getBlockStatus);
router.get("/user/:userId", isLoggedIn, getUserById);

router.put("/update-profile", isLoggedIn, updateProfile);

router.put("/upload-profile-pic", isLoggedIn, upload.single("profilePic"), uploadProfilePic);

router.get("/blocked-users", isLoggedIn, getBlockedUsers);

router.put("/update-privacy", isLoggedIn, updatePrivacy);

export default router;