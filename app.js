const express = require("express");
const path = require("path");
const app = express();
const cookieparser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const businessRouter = require("./routes/businessRouter");
const serviceRouter = require("./routes/serviceRoute");
const chatRouter = require("./routes/chatRoute");
const messageRouter = require("./routes/messageRoute");

app.use((req, res, next) => {
  console.log("hello from the middleware");
  req.requesTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(cookieparser());
app.use(mongoSanitize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

///Mounting routers

app.use("/api/v1/users", userRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);

module.exports = app;
