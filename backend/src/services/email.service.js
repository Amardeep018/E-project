const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.Email_User,
        pass: process.env.Email_Pass
    }
});


// OTP Email
const sendEmail = async (email, username, otp) => {
    const mailOptions = {
        from: `"Orvanta" <${process.env.Email_User}>`,
        to: email,
        subject: "🔐 Verify Your Orvanta Account",

        text: `
👋 Hello ${username},

🎉 Welcome to Orvanta!

Your verification OTP is:

🔐 OTP: ${otp}

⏰ This OTP is valid for 10 minutes.

🛡️ Do not share this OTP with anyone.

Best Regards,
✨ Team Orvanta
        `
    };

    return await transporter.sendMail(mailOptions);
};


// Welcome Email
const sendWelcomeEmail = async (email, username) => {
    const mailOptions = {
        from: `"Orvanta" <${process.env.Email_User}>`,
        to: email,
        subject: "🎉 Welcome to Orvanta - Registration Successful!",

        text: `
🎉 REGISTRATION SUCCESSFUL! 🎉

Hello ${username} 👋,

Congratulations! 🥳

Your email has been successfully verified and your Orvanta account has been created successfully. ✅

🚀 Welcome to the Orvanta family!

You can now log in to your account and start exploring all the amazing features of Orvanta.

🔐 Your account is now verified.
🛍️ Start exploring Orvanta.
✨ Enjoy your shopping experience!

Thank you for joining us. 💙

Best Regards,
✨ Team Orvanta
        `
    };

    return await transporter.sendMail(mailOptions);
};


module.exports = {
    sendEmail,
    sendWelcomeEmail
};