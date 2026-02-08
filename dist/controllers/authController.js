"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.verifyResetCode = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const sendEmail_1 = require("../utils/sendEmail");
// ================= REGISTER =================
const registerUser = async (req, res) => {
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
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.default.create({
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
            token: (0, generateToken_1.default)(user._id.toString(), user.role),
        });
    }
    catch (error) {
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
exports.registerUser = registerUser;
// ================= LOGIN =================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        // Find user
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
            token: (0, generateToken_1.default)(user._id.toString(), user.role),
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
        });
    }
};
exports.loginUser = loginUser;
// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes("@")) {
            return res.status(400).json({ message: "Valid email is required" });
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
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
        await (0, sendEmail_1.sendResetEmail)(email, resetCode);
        res.json({
            message: "Reset code sent to email",
            email: email,
            expiresIn: "10 minutes"
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: "Failed to process reset request",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.forgotPassword = forgotPassword;
// ================= VERIFY RESET CODE =================
const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }
        if (code.length !== 6 || !/^\d+$/.test(code)) {
            return res.status(400).json({ message: "Code must be 6 digits" });
        }
        const user = await User_1.default.findOne({
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
    }
    catch (error) {
        console.error("Verify code error:", error);
        res.status(500).json({
            message: "Failed to verify code",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.verifyResetCode = verifyResetCode;
// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
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
        const user = await User_1.default.findOne({
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
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        // Clear reset fields
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({
            message: "Password reset successful. You can now login with your new password.",
            email: email
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: "Failed to reset password",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.resetPassword = resetPassword;
// ================= UPDATE PASSWORD ================= (Optional)
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?._id; // Assuming you have auth middleware
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
};
exports.updatePassword = updatePassword;
