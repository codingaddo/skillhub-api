const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => console.log("DB connected successful"));
const port = 8000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
