const { StatusCodes } = require("http-status-codes");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getIo } = require("../sockets");

const createRoom = asyncHandler(async (req, res) => {
  const { participantId, bookingId } = req.validated.body;

  if (participantId === req.user._id.toString()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot start a chat with yourself");
  }

  const existingRoom = await ChatRoom.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(bookingId ? { booking: bookingId } : {}),
  });

  if (existingRoom) {
    return res.json({
      success: true,
      data: existingRoom,
    });
  }

  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
  }

  const room = await ChatRoom.create({
    booking: bookingId || null,
    participants: [req.user._id, participantId],
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Chat room created",
    data: room,
  });
});

const listMyRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({ participants: req.user._id })
    .populate("participants", "name role avatar")
    .populate("booking", "serviceName scheduleAt status meetingMode")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  res.json({
    success: true,
    data: rooms,
  });
});

const getRoomMessages = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findById(req.params.roomId);

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat room not found");
  }

  if (!room.participants.some((item) => item.toString() === req.user._id.toString())) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot access this chat room");
  }

  const messages = await Message.find({ room: room._id })
    .populate("sender", "name avatar role")
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: messages,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findById(req.params.roomId);

  if (!room) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat room not found");
  }

  if (!room.participants.some((item) => item.toString() === req.user._id.toString())) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You cannot send a message to this room");
  }

  const message = await Message.create({
    room: room._id,
    sender: req.user._id,
    content: req.validated.body.content,
    readBy: [req.user._id],
  });

  room.lastMessage = message.content;
  room.lastMessageAt = new Date();
  await room.save();

  const populatedMessage = await Message.findById(message._id).populate("sender", "name avatar role");
  getIo()?.to(room._id.toString()).emit("chat:new-message", populatedMessage);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Message sent",
    data: populatedMessage,
  });
});

module.exports = {
  createRoom,
  listMyRooms,
  getRoomMessages,
  sendMessage,
};
