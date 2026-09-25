const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // Email verification status
        verified: {
            type: Boolean,
            default: false
        },

        // OTP for email verification
        otp: {
            type: String
        },

        // OTP expiry time
        otpExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;