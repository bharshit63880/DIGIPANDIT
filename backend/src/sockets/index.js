const { Server } = require("socket.io");
const User = require("../models/User");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const { verifyToken } = require("../utils/jwt");
const env = require("../config/env");

let ioInstance = null;
const onlineUsers = new Map();

const initSocket = (server) => {
  const allowedOrigins = [
    ...env.corsOrigins,
    ...(!env.isProduction ? ["http://localhost:5173", "http://127.0.0.1:5173"] : []),
  ];

  ioInstance = new Server(server, {
    cors: {
      origin: [...new Set(allowedOrigins)],
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select("_id name role");
      if (!user || !user.isActive) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    ioInstance.emit("presence:update", { userId, online: true });

    socket.on("chat:join-room", async (roomId) => {
      const room = await ChatRoom.findById(roomId);
      if (room && room.participants.some((item) => item.toString() === userId)) {
        socket.join(roomId);
      }
    });

    socket.on("chat:send-message", async ({ roomId, content } = {}) => {
      if (typeof roomId !== "string" || typeof content !== "string" || content.trim().length > 2_000) {
        return socket.emit("chat:error", { message: "Invalid message payload" });
      }

      const room = await ChatRoom.findById(roomId);

      if (!room || !room.participants.some((item) => item.toString() === userId) || !content?.trim()) {
        return;
      }

      const message = await Message.create({
        room: roomId,
        sender: userId,
        content: content.trim(),
        readBy: [userId],
      });

      room.lastMessage = content.trim();
      room.lastMessageAt = new Date();
      await room.save();

      const populatedMessage = await Message.findById(message._id).populate("sender", "name avatar role");
      ioInstance.to(roomId).emit("chat:new-message", populatedMessage);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      ioInstance.emit("presence:update", { userId, online: false });
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = { initSocket, getIo, onlineUsers };
