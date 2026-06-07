import { Router } from "express";
import { loginUser, logoutUser, registerUser, searchUser , getUserData, getUserStatus, blockUser, unblockUser, getBlockStatus, getUserById} from "../controllers/user.controllers.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";

const router = Router();


router.post("/registerUser",registerUser);
router.post("/loginUser",loginUser);
router.post("/logoutUser",isLoggedIn,logoutUser);
router.get("/searchUser",isLoggedIn,searchUser);


router.get('/me',isLoggedIn,getUserData);

router.get("/status/:userId", isLoggedIn, getUserStatus);
router.put(
    "/block/:userId",
    isLoggedIn,
    blockUser
);

router.put(
    "/unblock/:userId",
    isLoggedIn,
    unblockUser
);

router.get(
    "/block-status/:userId",
    isLoggedIn,
    getBlockStatus
);

router.get("/user/:userId", isLoggedIn, getUserById);

export default router;