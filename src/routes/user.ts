import express from "express";
const router = express.Router();
import { signup, login } from "../controllers/user.controller";
import {
  signupValidator,
  loginValidator,
} from "../middlewares/validators/user.validator";

router.post("/signup/", signupValidator, signup);
router.post("/login/", loginValidator, login);

export default router;
