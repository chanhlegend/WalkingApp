// src/app/socket/index.js
const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["https://walking-app.vercel.app", "http://localhost:5173"],
      // ❗ đổi thành domain FE khi production
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join", ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
};
