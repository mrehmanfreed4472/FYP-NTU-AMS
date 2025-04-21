const mongoose = require("mongoose");

const ChatChannelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    type: { type: String, enum: ["private", "group"], required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("ChatChannel", ChatChannelSchema);
