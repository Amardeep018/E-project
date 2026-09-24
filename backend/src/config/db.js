const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);

        console.log("Mongo DB connected successfully");
    } catch (err) {
        console.error("Mongo DB connection failed:", err);
        process.exit(1);
    }
};

module.exports = connectDB;