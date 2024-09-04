import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    wardNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
    createdAt: { type: Date, default: Date.now },
    availableAt: { type: Date }, // Time when the doctor will be available for the next patient
    sessionDuration: { type: Number, default: 30 }, // Default session duration in minutes
});

export default mongoose.model("Doctor", DoctorSchema);