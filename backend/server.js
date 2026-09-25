require("dotenv").config();

const app = require("./src/app");
const config = require("./src/config/config");
const connectDB = require("./src/config/db");

connectDB();

app.listen(config.PORT, () => {
    console.log(`Server is running on port http://localhost:${config.PORT}`);
});