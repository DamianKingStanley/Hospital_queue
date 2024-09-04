import doctorModel from "../models/doctor.js";
import patientModel from "../models/patient.js";
import { io } from "../index.js";

export const registerPatient = async(req, res) => {
    try {
        const { name, patientId, reasonForVisit } = req.body;
        const patient = new patientModel({ name, patientId, reasonForVisit });
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const reasonToSpecialtyMap = {
    // General Practitioner (GP) / Family Medicine
    "Routine check-ups and physical exams": "General Practitioner",
    "Common illnesses (e.g., colds, flu, infections)": "General Practitioner",
    "Chronic disease management (e.g., diabetes, hypertension)": "General Practitioner",
    "Preventive care and vaccinations": "General Practitioner",
    "Referrals to specialists": "General Practitioner",

    // Pediatrics
    "Child wellness check-ups": "Pediatrics",
    "Growth and development monitoring": "Pediatrics",
    "Common childhood illnesses ": "Pediatrics",
    "Developmental disorders ": "Pediatrics",

    // Cardiology
    "Heart disease and conditions": "Cardiology",
    "Hypertension (high blood pressure)": "Cardiology",
    "Chest pain and angina": "Cardiology",
    "Arrhythmias ": "Cardiology",
    "Follow-up after heart surgery or procedures": "Cardiology",

    // Dermatology
    "Skin conditions (e.g., acne, eczema, psoriasis)": "Dermatology",
    "Skin infections (e.g., fungal infections, impetigo)": "Dermatology",
    "Skin cancer screenings": "Dermatology",
    "Cosmetic procedures (e.g., Botox, laser treatments)": "Dermatology",
    "Hair and nail disorders": "Dermatology",

    // Gynecology/Obstetrics (OB-GYN)
    "Pregnancy care and childbirth": "Gynecology/Obstetrics (OB-GYN)",
    "Menstrual disorders (e.g., irregular periods, heavy bleeding)": "Gynecology/Obstetrics (OB-GYN)",
    "Contraception and family planning": "Gynecology/Obstetrics (OB-GYN)",
    "Menopause management": "Gynecology/Obstetrics (OB-GYN)",
    "Screening for reproductive system cancers (e.g., cervical cancer, ovarian cancer)": "Gynecology/Obstetrics (OB-GYN)",

    // Orthopedics
    "Bone and joint conditions": "Orthopedics",
    "Sports injuries ": "Orthopedics",
    "Back pain and spinal disorders": "Orthopedics",
    "Joint replacement surgeries": "Orthopedics",
    "Pediatric orthopedic conditions": "Orthopedics",

    // Psychiatry
    "Mental health conditions (e.g., depression, anxiety, bipolar disorder)": "Psychiatry",
    "Substance abuse and addiction treatment": "Psychiatry",
    "Schizophrenia and psychosis": "Psychiatry",
    "Stress and trauma-related disorders": "Psychiatry",
    "Therapy and counseling services": "Psychiatry",

    // Neurology
    "Neurological disorders (e.g., epilepsy, Parkinson's disease)": "Neurology",
    "Headaches and migraines": "Neurology",
    "Stroke and cerebrovascular diseases": "Neurology",
    "Multiple sclerosis": "Neurology",
    "Peripheral neuropathy": "Neurology",

    // Gastroenterology
    "Digestive system disorders (e.g., irritable bowel syndrome, Crohn's disease)": "Gastroenterology",
    "Liver conditions (e.g., hepatitis, fatty liver disease)": "Gastroenterology",
    "Acid reflux and GERD": "Gastroenterology",
    "Colon cancer screening (e.g., colonoscopy)": "Gastroenterology",
    "Gallbladder and pancreatic issues": "Gastroenterology",

    // Pulmonology
    "Respiratory conditions (e.g., asthma, COPD)": "Pulmonology",
    "Lung infections (e.g., pneumonia, tuberculosis)": "Pulmonology",
    "Sleep apnea and sleep disorders": "Pulmonology",
    "Chronic cough and breathing difficulties": "Pulmonology",
    "Pulmonary hypertension": "Pulmonology",

    // Endocrinology
    "Diabetes management": "Endocrinology",
    "Thyroid disorders (e.g., hypothyroidism, hyperthyroidism)": "Endocrinology",
    "Hormonal imbalances (e.g., adrenal disorders, pituitary disorders)": "Endocrinology",
    "Osteoporosis and bone metabolism disorders": "Endocrinology",
    "Obesity and metabolic syndrome": "Endocrinology",

    // Urology
    "Urinary tract infections (UTIs)": "Urology",
    "Kidney stones and kidney disease": "Urology",
    "Male reproductive issues (e.g., erectile dysfunction, infertility)": "Urology",
    "Prostate health and prostate cancer screening": "Urology",
    "Incontinence and bladder control issues": "Urology",

    // Oncology
    "Cancer diagnosis and treatment": "Oncology",
    "Chemotherapy and radiation therapy management": "Oncology",
    "Palliative care for cancer patients": "Oncology",
    "Cancer screenings and preventive care": "Oncology",
    "Genetic counseling for cancer risk": "Oncology",

    // Ophthalmology
    "Vision problems and eye exams": "Ophthalmology",
    "Eye infections and injuries": "Ophthalmology",
    "Cataracts and glaucoma management": "Ophthalmology",
    "Diabetic eye disease monitoring": "Ophthalmology",
    "LASIK and other vision correction surgeries": "Ophthalmology",

    // Otolaryngology (ENT)
    "Ear infections and hearing loss": "Otolaryngology (ENT)",
    "Sinusitis and nasal problems": "Otolaryngology (ENT)",
    "Throat and voice disorders": "Otolaryngology (ENT)",
    "Tonsillitis and adenoid issues": "Otolaryngology (ENT)",
    "Head and neck surgery": "Otolaryngology (ENT)",

    // Rheumatology
    "Autoimmune disorders (e.g., lupus, rheumatoid arthritis)": "Rheumatology",
    "Chronic joint pain and inflammation": "Rheumatology",
    "Osteoarthritis and other degenerative joint diseases": "Rheumatology",
    "Gout and other crystal-induced arthropathies": "Rheumatology",
    "Fibromyalgia and chronic pain management": "Rheumatology",

    // Nephrology
    "Chronic kidney disease (CKD)": "Nephrology",
    "Dialysis management": "Nephrology",
    "Hypertension related to kidney problems": "Nephrology",
    "Kidney transplant follow-up": "Nephrology",
    "Electrolyte imbalances": "Nephrology",

    // Infectious Disease
    "Complex infections (e.g., HIV/AIDS, tuberculosis)": "Infectious Disease",
    "Travel medicine and vaccination": "Infectious Disease",
    "Hospital-acquired infections": "Infectious Disease",
    "Antibiotic-resistant infections": "Infectious Disease",
    "Immune system disorders related to infections": "Infectious Disease",

    // Emergency Medicine
    "Acute injuries (e.g., fractures, burns, wounds)": "Emergency Medicine",
    "Heart attack and stroke": "Emergency Medicine",
    "Severe allergic reactions (anaphylaxis)": "Emergency Medicine",
    "Poisoning and overdose": "Emergency Medicine",
    "Trauma and accidents": "Emergency Medicine",

    // Surgery (General Surgery)
    "Appendicitis and gallbladder surgery": "Surgery (General Surgery)",
    "Hernia repair": "Surgery (General Surgery)",
    "Abdominal and digestive tract surgery": "Surgery (General Surgery)",
    "Breast surgery (e.g., mastectomy)": "Surgery (General Surgery)",
    "Wound care and surgical follow-up": "Surgery (General Surgery)",
};

export const assignPatient = async(req, res) => {
    try {
        const patient = await patientModel.findOne({
            patientId: req.params.patientId,
        });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Determine the specialty based on the patient's reason for visit
        const specialty = reasonToSpecialtyMap[patient.reasonForVisit] || null;

        if (!specialty) {
            return res
                .status(404)
                .json({ error: "No matching specialty for the reason of visit" });
        }

        // Find a doctor who specializes in the determined specialty
        const doctor = await doctorModel.findOne({
            specialty,
            isAvailable: true,
        });

        if (!doctor) {
            return res
                .status(404)
                .json({ error: "No available doctor with the required specialty" });
        }

        // Assign the doctor to the patient
        patient.doctorAssigned = doctor._id;
        doctor.currentPatients.push(patient._id); // Push patient to the currentPatients array

        await patient.save();
        await doctor.save();

        // Emit a notification to all connected clients
        io.emit("patientAssigned", {
            message: `Patient ${patient.name} has been assigned to Dr. ${doctor.name}.`,
            patient,
            doctor,
        });

        res.status(200).json({ patient, doctor });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updatePatientStatus = async(req, res) => {
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
        }

        await patient.save();

        // Emit a notification to all connected clients
        io.emit("patientStatusUpdated", {
            message: `Patient ${patient.name}'s status has been updated to ${status}.`,
            patient,
        });

        // Notify all connected clients about the queue update
        const updatedQueue = await patientModel.find().sort({ createdAt: 1 });
        io.getIO().emit("queueUpdated", updatedQueue);

        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPatients = async(req, res) => {
    try {
        const patients = await patientModel
            .find()
            .populate("doctorAssigned")
            .sort({ createdAt: -1 }); // Sort by createdAt in descending order

        // Group patients by date
        const groupedByDate = patients.reduce((acc, patient) => {
            const date = patient.createdAt.toISOString().split("T")[0]; // Use only the date part
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(patient);
            return acc;
        }, {});

        res.status(200).json(groupedByDate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePatientId = async(req, res) => {
    try {
        const { patientId } = req.params;

        // Find the patient by the patientId
        const patient = await patientModel.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Clear the patientId
        patient.patientId = "";
        await patient.save();

        res
            .status(200)
            .json({ message: "Patient ID cleared successfully", patient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};