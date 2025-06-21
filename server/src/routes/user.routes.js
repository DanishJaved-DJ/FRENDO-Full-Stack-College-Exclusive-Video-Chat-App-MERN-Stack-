import {Router} from "express"
import { signup } from "../controllers/signUp.controllers.js";
import { upload } from "../middleware/upload.js";
import { login } from "../controllers/login.controller.js";
import { logout } from "../controllers/logOut.controller.js";
import { authMiddleware } from "../middleware/authMiddlewarw.js";
import { getProfile } from "../controllers/getProfile.controller.js";
import { updateProfile } from "../controllers/updateUser.controller.js";
import { changePassword } from "../controllers/changePassword.controller.js";
import  uploadAvatar  from "../controllers/avatar.contorller.js";
import { sendFriendRequest } from "../controllers/SendFriendRequest.js";
import { respondToFriendRequest } from "../controllers/responseToFriendRequest.js";
import { getFriends } from "../controllers/getFriends.controller.js";


const router=Router();

router.post("/signup", upload.single("collegeIdProof"), signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user-profile', authMiddleware, getProfile);
router.put('/updateProfile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.put('/avatar', authMiddleware, upload.single("avatarUrl"), uploadAvatar);

router.post('/friend-request', authMiddleware, sendFriendRequest);
router.post('/friend-response', authMiddleware, respondToFriendRequest);
router.get('/get-friends', authMiddleware, getFriends);

export default router;