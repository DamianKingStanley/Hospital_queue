import express from "express";
import auth from "../middleware/auth.js";

import {
    bookAppointment,
    getAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/bookappointment", auth, bookAppointment);
router.post("/getappointment", getAppointment);

export default router;