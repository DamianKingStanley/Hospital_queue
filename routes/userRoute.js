import express from "express";
import auth from "../middleware/auth.js";
import {
  userRegister,
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/user/register", userRegister);
router.post("/user/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset", resetPassword);
router.get("/users", auth(["admin"]), getAllUsers);

export default router;
