import doctorModel from "../models/doctor.js";
import patientModel from "../models/patient.js";
import moment from "moment";
import { io } from "../index.js";

export const getQueue = async(req, res) => {
    try {
        const startOfDay = moment().startOf("day").toDate();
        const endOfDay = moment().endOf("day").toDate();

        const queue = await patientModel
            .find({
                status: "waiting",
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            })
            .sort({ createdAt: 1 })
            .populate("doctorAssigned");

        res.status(200).json(queue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getInSessionPatients = async(req, res) => {
    try {
        const startOfDay = moment().startOf("day").toDate();
        const endOfDay = moment().endOf("day").toDate();

        const inSessionPatients = await patientModel
            .find({
                status: "in-session",
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            })
            .populate("doctorAssigned");

        res.status(200).json(inSessionPatients);
        // Emit the updated list of in-session patients to all connected clients
        io.emit("sessionUpdated", inSessionPatients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const waitSession = async(req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await patientModel.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        patient.status = "waiting";
        patient.appointmentStartTime = null; // Clear the appointment start time
        await patient.save();

        const updatedQueue = await patientModel.find({ status: "waiting" }).sort({
            createdAt: 1,
        });
        io.emit("queueUpdated", updatedQueue);

        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const startSession = async(req, res) => {
    try {
        const { patientId } = req.params;
        const { status } = req.body;

        const patient = await patientModel.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        patient.status = status;

        if (status === "in-session") {
            patient.appointmentStartTime = Date.now(); // Set the session start time
            patient.countdownStarted = true;
        }

        await patient.save();

        // Emit a notification when the session starts
        io.emit("sessionStarted", {
            message: `Session with Patient ${patient.name} and Dr. ${doctor.name} has started.`,
            patient,
            doctor,
        });

        const doctor = await doctorModel.findById(patient.doctorAssigned);
        doctor.isAvailable = false;
        // doctor.currentPatients = null;
        await doctor.save();

        // Notify all connected clients about the queue update
        const updatedQueue = await patientModel.find({ status: "waiting" }).sort({
            createdAt: 1,
        });
        io.emit("queueUpdated", updatedQueue);

        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const completeSession = async(req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await patientModel.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        patient.status = "done";
        await patient.save();

        const doctor = await doctorModel.findById(patient.doctorAssigned);
        doctor.isAvailable = true;
        doctor.currentPatients = null;
        await doctor.save();

        // Emit a notification when the session is completed
        io.emit("sessionCompleted", {
            message: `Session with Patient ${patient.name} and Dr. ${doctor.name} has been completed.`,
            patient,
            doctor,
        });

        // Notify all connected clients about the queue update
        const updatedQueue = await patientModel.find({ status: "waiting" }).sort({
            createdAt: 1,
        });
        io.emit("queueUpdated", updatedQueue);

        res.status(200).json({ patient, doctor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};