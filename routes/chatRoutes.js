const express = require("express");
const { generateChatToken, createPrivateChat, createGroupChat, joinGroupChat, sendMessage,getMessages } = require("../controllers/chatController");

const router = express.Router();

router.post("/token", generateChatToken);
router.post("/private", createPrivateChat);
router.post("/group", createGroupChat);
router.post("/group/join", joinGroupChat);
router.post("/message", sendMessage);
router.get("/getMessages/:channelId",getMessages);

module.exports = router;
