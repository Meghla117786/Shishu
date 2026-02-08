import nodemailer from 'nodemailer';

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Add email verification function
export const sendResetEmail = async (to: string, resetCode: string): Promise<void> => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials not configured');
        }

        const mailOptions = {
            from: `"Shishu Doctor" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Password Reset Code - Shishu Doctor',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                    </div>
                    <div style="background: white; padding: 40px; color: #333;">
                        <h2 style="color: #333; margin-top: 0;">Hello,</h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            You requested to reset your password for your Shishu Doctor account.
                            Use the verification code below to complete the process:
                        </p>
                        
                        <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #c41446;">
                                ${resetCode}
                            </div>
                            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                                This code will expire in 10 minutes
                            </p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; line-height: 1.6;">
                            If you didn't request this password reset, please ignore this email.
                            Your account security is important to us.
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 12px; color: #999;">
                                This is an automated message from Shishu Doctor.<br>
                                Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </div>
            `,
            text: `Your password reset code is: ${resetCode}\nThis code will expire in 10 minutes.\nIf you didn't request this, please ignore this email.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent to ${to}`);
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw new Error('Failed to send reset email');
    }
};

// Optional: Add email verification for account creation
export const sendVerificationEmail = async (to: string, verificationLink: string): Promise<void> => {
    try {
        const mailOptions = {
            from: `"Shishu Doctor" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Verify Your Email - Shishu Doctor',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Shishu Doctor!</h2>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}" style="display: inline-block; background: #c41446; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};