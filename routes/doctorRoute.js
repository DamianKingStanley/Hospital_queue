import express from "express";
import {
    createDoctor,
    getAllDoctors,
    updateDoctorAvailability,
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/doctor/register", createDoctor);
router.get("/get-doctors", getAllDoctors);
router.patch("/update-doctor/:doctorId", updateDoctorAvailability);

export default router;