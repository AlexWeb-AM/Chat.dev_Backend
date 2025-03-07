import userModel from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Password" });
        }

        const token = generateToken(user._id);
        setTokenCookie(res, token);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                routeId: user.routeId,
            },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing details" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            routeId: uuidv4(),
        });

        await user.save();
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        const savedUser = await userModel.findById(user._id).select("-password");

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUser,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};
