const { StreamChat } = require("stream-chat");
require("dotenv").config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const chatClient = StreamChat.getInstance(apiKey, apiSecret);

if (!chatClient) {
    return res.status(500).json({ error: "Chat client not initialized" });
}
// console.log("Chat client initialized:", chatClient);


module.exports = chatClient;
