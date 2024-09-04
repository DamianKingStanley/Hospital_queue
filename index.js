import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoute from "./routes/userRoute.js";
import patientRoute from "./routes/patientRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import queueRoute from "./routes/queueRouter.js";

dotenv.config();
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

// Create an HTTP server and bind Socket.io to it
const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "*", // Adjust according to your frontend's domain if needed
        methods: ["GET", "POST"],
    },
});

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log("New client connected");
});

// Make the Socket.io instance available globally
app.set("io", io);

// const notifyPatient = (io, patient) => {
//     io.emit("notifyPatient", {
//         message: `Dear ${patient.name}, your session with Dr. ${patient.doctorAssigned.name} is about to start.`,
//     });
// };

// const notifyStaff = (io, patient) => {
//     io.emit("notifyStaff", {
//         message: `Attention: The session for patient ${patient.name} is about to end. Prepare for the next patient.`,
//     });
// };

// MongoDB connection
mongoose
    .connect(MONGODB_URL)
    .then(() =>
        server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    )
    .catch((error) => console.error("Failed to connect to MongoDB:", error));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome" });
});

app.use("/", userRoute);
app.use("/", patientRoute);
app.use("/", doctorRoute);
app.use("/", queueRoute);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});