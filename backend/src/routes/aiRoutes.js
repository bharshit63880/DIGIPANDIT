const express = require("express");
const { chatWithPanditJi } = require("../controllers/aiController");

const router = express.Router();

router.post("/panditji-chat", chatWithPanditJi);

module.exports = router;
