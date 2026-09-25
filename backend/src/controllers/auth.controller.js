const userModel = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
            otp: otp.toString(),
            otpExpires,
            verified: false
        });

        // Check user creation
        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User creation failed"
            });
        }

        // Send OTP
        await sendEmail(
            user.email,
            user.username,
            otp
        );

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
        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Check OTP
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
        user.verified = true;

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        // Save changes
        await user.save();

        console.log("Email verified:", user.email);

        // Send welcome email
        await sendWelcomeEmail(
            user.email,
            user.username
        );

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


// ================= LOGIN USER =================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Check email verification
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before login"
            });
        }

        // 4. Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 5. Generate JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // 6. Store JWT in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 7. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ================= EXPORT =================

module.exports = {
    registerUser,
    verifyRegisterOTP,
    loginUser
};