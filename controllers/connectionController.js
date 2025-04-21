const Alumni = require('../models/Alumni');

// Send Connection Request
exports.connectAlumni = async (req, res) => {
    try {
        const { alumniId } = req.body; // ID of the Alumni to connect with
        const userAlumni = await Alumni.findOne({ userId: req.user.id });

        if (!userAlumni) return res.status(404).json({ message: "Alumni profile not found" });

        if (userAlumni.connections.includes(alumniId)) {
            return res.status(400).json({ message: "Already connected" });
        }

        userAlumni.connections.push(alumniId);
        await userAlumni.save();

        res.status(200).json({ message: "Connection successful", connections: userAlumni.connections });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllAlumniWithStatus = async (req, res) => {
    try {
        // Fetch the logged-in user's alumni profile
        const userAlumni = await Alumni.findOne({ userId: req.user.id });

        if (!userAlumni) {
            console.log("No alumni profile found for user:", req.user.id);
            return res.status(404).json({ message: "Alumni profile not found" });
        }

        // Fetch all other alumni
        const allAlumni = await Alumni.find({ userId: { $ne: req.user.id } })
            .select('_id userId contactInfo education batch')
            .populate('userId', 'name');

        console.log("All alumni fetched:", allAlumni);

        // Convert connection ObjectIds to strings for easier comparison
        const connectedAlumniIds = userAlumni.connections.map(id => id.toString());
        console.log("Connected Alumni IDs:", connectedAlumniIds);

        // Map alumni to return only required fields
        const alumniWithStatus = allAlumni.map(alumni => {
            const latestDegree = alumni.education.length > 0 
                ? alumni.education[alumni.education.length - 1].degree 
                : "N/A";

            const isConnected = connectedAlumniIds.includes(alumni._id.toString());

            console.log(`Alumni: ${alumni.userId.name}, Alumni ID: ${alumni._id}, Connected: ${isConnected}`);

            return {
                name: alumni.userId.name,
                id: alumni._id,
                degree: latestDegree,
                batch: alumni.batch || "N/A",
                location: alumni.contactInfo?.location || "N/A",
                isConnected: isConnected
            };
        });

        res.status(200).json({ alumni: alumniWithStatus });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAlumniByBatch = async (req, res) => {
    try {
        const { batch } = req.query;

        if (!batch) {
            return res.status(400).json({ message: "Batch is required" });
        }

        const userAlumni = await Alumni.findOne({ userId: req.user.id });

        if (!userAlumni) {
            return res.status(404).json({ message: "Alumni profile not found" });
        }

        const allAlumni = await Alumni.find({ 
            userId: { $ne: req.user.id }, 
            batch: batch 
        })
        .select('_id userId contactInfo education batch')
        .populate('userId', 'name');

        const connectedAlumniIds = userAlumni.connections.map(id => id.toString());

        const alumniWithStatus = allAlumni.map(alumni => {
            const latestDegree = alumni.education.length > 0 
                ? alumni.education[alumni.education.length - 1].degree 
                : "N/A";

            return {
                name: alumni.userId.name,
                id: alumni._id,
                degree: latestDegree,
                location: alumni.contactInfo?.location || "N/A",
                batch: alumni.batch,
                isConnected: connectedAlumniIds.includes(alumni._id.toString())
            };
        });

        res.status(200).json({ alumni: alumniWithStatus });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.getAlumniByDegree = async (req, res) => {
    try {
        const { degree } = req.query;

        if (!degree) {
            return res.status(400).json({ message: "Degree is required" });
        }

        const userAlumni = await Alumni.findOne({ userId: req.user.id });

        if (!userAlumni) {
            return res.status(404).json({ message: "Alumni profile not found" });
        }

        const allAlumni = await Alumni.find({ 
            userId: { $ne: req.user.id }, 
            "education.degree": degree 
        })
        .select('_id userId contactInfo education')
        .populate('userId', 'name');

        const connectedAlumniIds = userAlumni.connections.map(id => id.toString());

        const alumniWithStatus = allAlumni.map(alumni => {
            const latestDegree = alumni.education.length > 0 
                ? alumni.education[alumni.education.length - 1].degree 
                : "N/A";

            return {
                name: alumni.userId.name,
                id: alumni._id,
                degree: latestDegree,
                location: alumni.contactInfo?.location || "N/A",
                isConnected: connectedAlumniIds.includes(alumni._id.toString())
            };
        });

        res.status(200).json({ alumni: alumniWithStatus });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        res.status(500).json({ error: error.message });
    }
};
