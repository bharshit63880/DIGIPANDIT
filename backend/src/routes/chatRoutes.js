const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createRoomSchema, sendMessageSchema } = require("../validators/chatValidators");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/rooms", protect, validate(createRoomSchema), chatController.createRoom);
router.get("/rooms", protect, chatController.listMyRooms);
router.get("/rooms/:roomId/messages", protect, chatController.getRoomMessages);
router.post("/rooms/:roomId/messages", protect, validate(sendMessageSchema), chatController.sendMessage);

module.exports = router;
