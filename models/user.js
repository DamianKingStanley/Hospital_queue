import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    userId: { type: String },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ["staff", "patient"], required: true },
    profilePicture: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
}, {
    timestamps: true,
});

export default mongoose.model("User", userSchema);