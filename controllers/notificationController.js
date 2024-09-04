import { io } from "../index.js";

export const notifyPatientSessionAboutToStart = (io, patient) => {
    io.emit("notifyPatient", {
        message: `Dear ${patient.name}, your session with Dr. ${patient.doctorAssigned.name} is about to start.`,
    });
};

export const notifyStaff = (io, patient) => {
    io.emit("notifyStaff", {
        message: `Attention: The session for patient ${patient.name} is about to end. Prepare for the next patient.`,
    });
};

export const notifyPatientAssignToDoctor = (io, doctor) => {
    io.emit("notifyDoctor", {
        message: `Dear ${doctor.name},  ${doctor.currentPatients} is assigned to you`,
    });
};