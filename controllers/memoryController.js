const Memory = require('../models/Memory');
const Alumni = require('../models/Alumni');


exports.createMemory = async (req, res) => {
    try {
        console.log("Received request to create memory");
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);
        console.log("Authenticated user ID:", req.user?.id);

        const { description } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!image) {
            console.log("Image is missing");
            return res.status(400).json({ message: "Image is required" });
        }

        const newMemory = new Memory({ userId: req.user.id, image, description });

        console.log("Saving new memory:", newMemory);
        await newMemory.save();

        res.status(201).json({ message: "Memory shared successfully", memory: newMemory });
    } catch (error) {
        console.error("Error creating memory:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getAllMemories = async (req, res) => {
    try {
        console.log("Fetching all public memories...");

        const memories = await Memory.find()
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const alumniDetails = await Alumni.find({}, 'userId batch experience')
            .populate('userId', 'name')
            .lean();

        const alumniData = alumniDetails.map(alumni => {
            const currentExperience = alumni.experience.filter(exp => exp.isPresent);
            return {
                userId: alumni.userId._id,
                name: alumni.userId.name,
                batch: alumni.batch,
                companyName: currentExperience.length ? currentExperience[0].companyName : null,
                role: currentExperience.length ? currentExperience[0].role : null
            };
        });

        const response = memories.map(memory => {
            const alumniInfo = alumniData.find(alumni => alumni.userId.equals(memory.userId._id));
            return {
                userId: memory.userId._id,
                name: memory.userId.name,
                memory: memory.description,
                pic: memory.image,
                batch: alumniInfo?.batch || null,
                companyName: alumniInfo?.companyName || null,
                role: alumniInfo?.role || null
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


