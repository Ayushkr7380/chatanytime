import { Router } from "express";
import { loginUser, logoutUser, registerUser, searchUser , getUserData} from "../controllers/user.controllers.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";

const router = Router();


router.post("/registerUser",registerUser);
router.post("/loginUser",loginUser);
router.post("/logoutUser",isLoggedIn,logoutUser);
router.get("/searchUser",isLoggedIn,searchUser);


router.get('/me',isLoggedIn,getUserData);

export default router;