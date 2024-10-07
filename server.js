// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const http = require("http");
// const socketIo = require("socket.io");

// dotenv.config({ path: "./config.env" });
// const app = require("./app");

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// mongoose.connect(DB, {}).then(() => console.log("DB connected successful"));
// const port = 8000;

// const server = app.listen(port, () => {
//   console.log(`Server is running on port ${port}...`);
// });

// server.js

require('dotenv').config();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => console.log("DB connected successful"));

// Create the HTTP server and attach the Express app to it
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIo(server);

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listening to client messages
  socket.on("message", (msg) => {
    console.log("Message from client:", msg);
    // Emit a message back to the client
    socket.emit("message", "Message received by server");
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
