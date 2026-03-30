const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: { type: String, trim: true },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

chatRoomSchema.index({ participants: 1, lastMessageAt: -1 });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
