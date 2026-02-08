import express from 'express';
import {
    registerUser,
    loginUser,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    updatePassword
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
// import { protect } from '../middleware/authMiddleware'; // If you have auth middleware

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected route (requires authentication)
router.post('/update-password', protect, updatePassword);

export default router;