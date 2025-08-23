import {Router} from "express"
import { signup } from "../controllers/userController/signUp.controllers.js";
import { upload } from "../middleware/upload.js";
import { login } from "../controllers/userController/login.controller.js";
import { logout } from "../controllers/userController/logOut.controller.js";
import { authMiddleware } from "../middleware/authMiddlewarw.js";
import { getProfile } from "../controllers/userController/getProfile.controller.js";
import { updateProfile } from "../controllers/userController/updateUser.controller.js";
import { changePassword } from "../controllers/userController/changePassword.controller.js";
import  uploadAvatar  from "../controllers/userController/avatar.contorller.js";
import { sendFriendRequest } from "../controllers/friendController/SendFriendRequest.js";
import { respondToFriendRequest } from "../controllers/friendController/responseToFriendRequest.js";
import { getFriends } from "../controllers/friendController/getFriends.controller.js";
import { shareFile } from "../controllers/shareFile.controller.js";


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

router.post('/upload', upload.single("file"), shareFile);

export default router;