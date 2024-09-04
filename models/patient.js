import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    patientId: { type: String, required: true },
    reasonForVisit: { type: String, required: true },
    doctorAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    status: {
        type: String,
        enum: ["waiting", "in-session", "done"],
        default: "waiting",
    },
    createdAt: { type: Date, default: Date.now },
    appointmentStartTime: { type: Date }, // Tracks when the appointment is scheduled to start
    countdownStarted: { type: Boolean, default: false }, // Indicates if the countdown has started
});

export default mongoose.model("Patient", patientSchema);