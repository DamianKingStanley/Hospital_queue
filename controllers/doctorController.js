import doctorModel from "../models/doctor.js";
import { io } from "../index.js";

export const createDoctor = async(req, res) => {
    try {
        const { name, specialty, wardNumber } = req.body;
        const doctor = new doctorModel({ name, specialty, wardNumber });
        await doctor.save();
        res.status(201).json(doctor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllDoctors = async(req, res) => {
    try {
        const doctors = await doctorModel.find();
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateDoctorAvailability = async(req, res) => {
    try {
        const { doctorId } = req.params;
        const { isAvailable } = req.body;

        const doctor = await doctorModel.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        doctor.isAvailable = isAvailable;
        await doctor.save();

        // Emit a notification to all connected clients
        io.emit("doctorAvailabilityChanged", {
            message: `Doctor ${doctor.name} is now ${
        isAvailable ? "available" : "unavailable"
      }.`,
            doctorId: doctor._id,
            isAvailable: doctor.isAvailable,
        });

        res.status(200).json({ message: "Doctor availability updated", doctor });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};