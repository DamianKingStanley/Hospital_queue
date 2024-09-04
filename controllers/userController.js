import userModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../forgetpasswordemail.js";

dotenv.config();
export const userRegister = async(req, res) => {
    try {
        const { fullname, email, password, role, secretKey } = req.body;

        // Check if the role is admin and validate the secret key
        if (role === "staff" && secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res
                .status(401)
                .json({ message: "Invalid secret key for staff registration" });
        }

        const oldUser = await userModel.findOne({ email });
        if (oldUser) {
            return res.status(401).json({ message: "email already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = await userModel.create({
            fullname,
            email,
            password: hashPassword,
            role,
        });

        res.status(201).json({ message: " Registered successfully.", newUser });
    } catch (error) {
        res
            .status(400)
            .json({ message: "Error registering Try again later.", error });
    }
};
export const login = async(req, res) => {
    try {
        const { email, password, role } = req.body;
        const secret = process.env.JWT_SECRET;

        const oldUser = await userModel.findOne({ email });
        if (!oldUser) {
            return res.status(401).json({ message: "Wrong Badge Number" });
        }
        if (oldUser.role !== role) {
            return res.status(401).json({ message: "Invalid role" });
        }

        const checkPassword = await bcrypt.compare(password, oldUser.password);
        if (!checkPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: oldUser._id, role: oldUser.role }, secret, {
            expiresIn: "1h",
        });
        const formattedResult = {
            id: oldUser._id,
            email: oldUser.email,
            fullname: oldUser.fullname,
            role: oldUser.role,
        };

        res.status(200).json({ result: formattedResult, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllUsers = async(req, res) => {
    try {
        const { search } = req.query; // Get search query from URL parameters

        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, "i"); // Case-insensitive search
            query = {
                $or: [
                    { userId: searchRegex },
                    { fullname: searchRegex },
                    { username: searchRegex },
                ],
            };
        }

        const users = await userModel.find(query, "userId fullname username"); // Fetch fields
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users.", error });
    }
};

// FORGET PASSWORD
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = uuidv4();
        const tokenExpires = Date.now() + 3600000;
        user.resetToken = token;
        user.resetTokenExpires = tokenExpires;
        await user.save();

        const mailOptions = {
            from: "inkypenadmin@inkypen.com.ng",
            to: email,
            subject: "Password Reset",
            html: ` <p> You are receiving this mail because you rquested for password reset. If you didn't, kindly ignore this. Thank you! 
            <p>Click <a href="https://inkypen.com.ng/reset-password/${token}">here</a> to reset your password.</p>
            
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Email sent. Check your inbox." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const resetPassword = async(req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await userModel.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        // const salt = await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        // user.password = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};