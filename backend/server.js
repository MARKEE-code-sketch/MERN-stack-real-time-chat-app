const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./middleware/errrorMiddleware");

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS (for local development)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ✅ Deployment configuration
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Point to the React build folder
  const frontendPath = path.join(__dirname1, "frontend", "build");
  app.use(express.static(frontendPath));

  // Serve React app for unknown routes
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server and attach socket.io
const server = createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket.IO Events
io.on("connection", (socket) => {
  console.log("⚡ New client connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
