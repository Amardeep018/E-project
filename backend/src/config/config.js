require("dotenv").config();

const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI
};

if (!config.PORT) {
    throw new Error("PORT is missing in .env file");
}

if (!config.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env file");
}

module.exports = config;