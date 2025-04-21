const ChatChannel = require("../models/ChatChannel");
const ChatMessage = require("../models/ChatMessage");
const chatClient = require("../config/stream");
const mongoose = require("mongoose");
const User = require("../models/User"); 


// Generate chat token for authentication
exports.generateChatToken = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const token = chatClient.createToken(userId);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create private chat between two users
exports.createPrivateChat = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) return res.status(400).json({ error: "User IDs required" });

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(400).json({ error: "Invalid sender or receiver ID" });
        }


        if (!chatClient) return res.status(500).json({ error: "Chat client not initialized" });
        console.log("Sender:", senderId);
        console.log("Receiver:", receiverId);


        try {
            await chatClient.upsertUsers([
                { id: senderId, name: `User-${senderId}` },
                { id: receiverId, name: `User-${receiverId}` }
            ]);            
        } catch (err) {
            return res.status(500).json({ error:err.message});
        }

        const channelId = `${senderId}-${receiverId}`;
        let channel = chatClient.channel("messaging", channelId, {
            members: [senderId, receiverId],
            created_by_id: senderId
        });

        try {
            await channel.create();
        } catch (err) {
            console.warn("Channel already exists, using existing one.");
        }

        console.log("Channel ID:", channelId);
        console.log("Chat Channel:", channel);


        // Store private chat in MongoDB (ensure it doesn’t duplicate)
        const existingChannel = await ChatChannel.findOne({ channelId });
        if (!existingChannel) {
            const newChannel = new ChatChannel({ 
                channelId, 
                type: 'private', 
                members: [senderId, receiverId], 
                createdBy: senderId 
            });
            await newChannel.save();
        }

        res.json({ channelId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a group chat and store it in the database
exports.createGroupChat = async (req, res) => {
    try {
        const { creatorId, groupName } = req.body;
        if (!creatorId || !groupName) return res.status(400).json({ error: "Creator ID and Group Name required" });

        const uniqueGroupName = `${groupName}-${creatorId}`; // Ensure uniqueness
        const channel = chatClient.channel("team", uniqueGroupName, { created_by_id: creatorId });

        try {
            await channel.create();
        } catch (err) {
            console.warn("Group channel already exists, using existing one.");
        }

        // Store group chat in MongoDB if not already present
        const existingChannel = await ChatChannel.findOne({ channelId: uniqueGroupName });
        if (!existingChannel) {
            const newChannel = new ChatChannel({ 
                channelId: uniqueGroupName, 
                type: 'group', 
                members: [creatorId], 
                createdBy: creatorId 
            });
            await newChannel.save();
        }

        res.json({ channelId: uniqueGroupName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Join a group chat and update the database
exports.joinGroupChat = async (req, res) => {
    try {
        const { userId, channelId } = req.body;
        if (!userId || !channelId) return res.status(400).json({ error: "User ID and Channel ID required" });

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        const channel = chatClient.channel("team", channelId);
        await channel.addMembers([userId]);

        // Update group members in MongoDB
        await ChatChannel.findOneAndUpdate(
            { channelId },
            { $addToSet: { members: userId } },
            { new: true }
        );

        res.json({ message: "Joined group successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send a message and store it in the database
exports.sendMessage = async (req, res) => {
    try {
        const { userId, channelId, text } = req.body;
        if (!userId || !channelId || !text) return res.status(400).json({ error: "All fields required" });

        let channelType = "messaging";
        const chatChannel = await ChatChannel.findOne({ channelId });

        if (chatChannel && chatChannel.type === "group") {
            channelType = "team";
        }

        const channel = chatClient.channel(channelType, channelId);
        const message = await channel.sendMessage({
            text,
            user_id: userId
        });

        // Store message in MongoDB
        const newMessage = new ChatMessage({ channelId, userId, text });
        await newMessage.save();

        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Fetch messages from a chat
exports.getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) return res.status(400).json({ error: "Channel ID required" });

        const messages = await ChatMessage.find({ channelId }).sort({ createdAt: 1 });

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



