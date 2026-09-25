const userModel = require("../models/auth.model");
const bcrypt = require("bcryptjs");

const {
    sendEmail,
    sendWelcomeEmail
} = require("../services/email.service");


// ================= REGISTER USER =================

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, email and password"
            });
        }

        // Check existing user
        const isAlreadyExists = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (isAlreadyExists) {
            if (isAlreadyExists.username === username) {
                return res.status(409).json({
                    success: false,
                    message: "User already exists with this username"
                });
            }

            if (isAlreadyExists.email === email) {
                return res.status(409).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        );

        // OTP expires after 10 minutes
        const otpExpires = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hashPassword,

            // Store OTP as String
            otp: otp.toString(),

            otpExpires,

            // Correct field name
            isVerified: false
        });

        // Check user creation`
        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User creation failed"
            });
        }

        // Send OTP to user's email
        await sendEmail(
            user.email,
            user.username,
            otp
        );

        // Response
        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your email.",
            userId: user._id
        });

    } catch (error) {

        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ================= VERIFY REGISTER OTP =================

const verifyRegisterOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        // Validate
        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required"
            });
        }

        // Find user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Check OTP
        // Database OTP = String
        // Request OTP = String
        if (user.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check OTP expiry
        if (
            !user.otpExpires ||
            user.otpExpires < new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Verify user
        user.isVerified = true;

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        // Send Welcome Email
        await sendWelcomeEmail(
            user.email,
            user.username
        );

        // Success response
        return res.status(200).json({
            success: true,
            message: "Email verified successfully. Welcome email sent."
        });

    } catch (error) {

        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ================= EXPORT =================

module.exports = {
    registerUser,
    verifyRegisterOTP
};