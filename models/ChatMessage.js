const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
