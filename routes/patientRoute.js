import express from "express";

import {
    registerPatient,
    getAllPatients,
    assignPatient,
    updatePatientStatus,
    deletePatientId,
} from "../controllers/patientController.js";

const router = express.Router();

router.post("/patient/register", registerPatient);
router.get("/patients", getAllPatients);
router.post("/assign-doctor/:patientId", assignPatient);
router.post("/update-status/:patientId", updatePatientStatus);
router.patch("/delete-patient-id/:patientId", deletePatientId);

export default router;