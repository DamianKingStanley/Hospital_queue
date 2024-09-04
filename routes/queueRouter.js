import express from "express";

import {
    getQueue,
    getInSessionPatients,
    waitSession,
    startSession,
    completeSession,
} from "../controllers/queueController.js";
const router = express.Router();

router.get("/queue", getQueue);
router.get("/session", getInSessionPatients);
router.post("/wait/:patientId", waitSession);
router.post("/start-session/:patientId", startSession);
router.post("/complete-session/:patientId", completeSession);

export default router;