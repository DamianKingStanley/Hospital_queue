import appointmentModel from "../models/appointment.js";
import doctorModel from "../models/doctor.js";

export const bookAppointment = async(req, res) => {
    const { doctorId, date, time } = req.body;
    try {
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const appointment = new appointmentModel({
            patient: req.user.id,
            doctor: doctor._id,
            date,
            time,
        });

        doctor.availableSlots.forEach((slot) => {
            if (slot.date === date && slot.time === time) {
                slot.isBooked = true;
            }
        });

        await appointment.save();
        await doctor.save();

        res.status(201).json({ message: "Appointment booked", appointment });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getAppointment = async(req, res) => {
    try {
        const appointments = await appointmentModel
            .find({
                patient: req.user.id,
            })
            .populate("doctor");
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};