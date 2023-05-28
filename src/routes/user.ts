import express from "express";
const router = express.Router();
import {
  signup,
  login,
  updateProfile,
  refreshToken,
} from "../controllers/user.controller";
import {
  signupValidator,
  loginValidator,
  ProfileValidator,
  refreshTokenValidator,
} from "../middlewares/validators/user.validator";

import { profileUpload } from "../utils/multer";
import { authorize } from "../middlewares/authentication/auth";

router.post("/signup/", signupValidator, signup);
router.post("/login/", loginValidator, login);
router.post(
  "/profile/",
  authorize,
  ProfileValidator,
  profileUpload.single("image"),
  updateProfile
);

router.post("/token/", refreshTokenValidator, refreshToken);
export default router;
