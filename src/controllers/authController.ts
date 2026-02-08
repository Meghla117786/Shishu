import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import { sendResetEmail } from "../utils/sendEmail";

// ================= REGISTER =================
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Role validation
        if (role && !["admin", "user"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "user",
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (error: any) {
        console.error("Register error:", error);

        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already registered" });
        }

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// ================= LOGIN =================
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Success response
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server error",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes("@")) {
            return res.status(400).json({ message: "Valid email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // For security, always return success even if user doesn't exist
        if (!user) {
            return res.json({
                message: "If an account exists with this email, a reset code has been sent",
                email: email
            });
        }

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration (10 minutes from now)
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Send email
        await sendResetEmail(email, resetCode);

        res.json({
            message: "Reset code sent to email",
            email: email,
            expiresIn: "10 minutes"
        });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: "Failed to process reset request",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// ================= VERIFY RESET CODE =================
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            return res.status(400).json({ message: "Code must be 6 digits" });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: new Date() } // Check if not expired
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset code. Please request a new one."
            });
        }

        res.json({
            message: "Code verified successfully",
            email: email,
            code: code // Return code for use in next step
        });
    } catch (error: any) {
        console.error("Verify code error:", error);
        res.status(500).json({
            message: "Failed to verify code",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validation
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                message: "Email, code, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Find user with valid code
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset code. Please request a new one."
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            message: "Password reset successful. You can now login with your new password.",
            email: email
        });
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: "Failed to reset password",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// ================= UPDATE PASSWORD ================= (Optional)
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (req as any).user?._id; // Assuming you have auth middleware

        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error: any) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
};