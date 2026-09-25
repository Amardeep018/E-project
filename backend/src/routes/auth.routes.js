const express = require("express");

const {
    registerUser,
    verifyRegisterOTP,
    loginUser
} = require("../controllers/auth.controller");


const router = express.Router();


// Register
router.post("/register", registerUser);
// Verify Register OTP
router.post("/verify-register-otp", verifyRegisterOTP);

//Login

router.post("/login",loginUser);


module.exports = router;