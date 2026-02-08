"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import { protect } from '../middleware/authMiddleware'; // If you have auth middleware
const router = express_1.default.Router();
// Public routes
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/verify-reset-code', authController_1.verifyResetCode);
router.post('/reset-password', authController_1.resetPassword);
// Protected route (requires authentication)
router.post('/update-password', authMiddleware_1.protect, authController_1.updatePassword);
exports.default = router;
