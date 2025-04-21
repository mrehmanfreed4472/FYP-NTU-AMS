const Alumni = require('../models/Alumni');

// Register Alumni
exports.registerAlumni = async (req, res) => {
    try {
        const existingAlumni = await Alumni.findOne({ userId: req.user.id });
        if (existingAlumni) return res.status(400).json({ message: "Alumni profile already exists" });

        const newAlumni = new Alumni({ userId: req.user.id, ...req.body });
        await newAlumni.save();

        res.status(201).json({ message: "Alumni profile created successfully",newAlumni });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Alumni Profile
exports.getAlumniProfile = async (req, res) => {
    try {
        const { id } = req.params; // Extract alumni ID from URL

        const alumni = await Alumni.findOne({ userId: id }).populate('userId', 'name email');
        if (!alumni) return res.status(404).json({ message: "Alumni profile not found" });

        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update Alumni Profile
exports.updateAlumniProfile = async (req, res) => {
    try {
        const updatedAlumni = await Alumni.findOneAndUpdate({ userId: req.user.id }, req.body, { new: true });
        res.json(updatedAlumni);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete Alumni Profile
exports.deleteAlumniProfile = async (req, res) => {
    try {
        await Alumni.findOneAndDelete({ userId: req.user.id });
        res.json({ message: "Alumni profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get All Alumni with Selected Fields and Pagination
exports.getAllAlumni = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default: page 1, limit 10

        const alumni = await Alumni.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'name') // Get only the name from the User model
            .select('batch experience'); // Select batch and experience fields

        // Format the response to include only required fields
        const formattedAlumni = alumni.map(alumnus => {
            // Find the current job where isPresent is true
            const currentJob = alumnus.experience.find(exp => exp.isPresent === true) || null;

            return {
                id: alumnus.userId,  // Changed to userId (without _id)
                name: alumnus.userId?.name || "Unknown",
                batch: alumnus.batch || "N/A",
                jobTitle: currentJob ? currentJob.role : "Not Available",
                companyName: currentJob ? currentJob.companyName : "Not Available"
            };
        });

        const totalAlumni = await Alumni.countDocuments();

        res.json({
            totalAlumni,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalAlumni / limit),
            alumni: formattedAlumni
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Alumni by Degree
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
                id: alumni.userId,  // Changed to userId (without _id)
                degree: latestDegree,
                location: alumni.contactInfo?.location || "N/A",
                isConnected: connectedAlumniIds.includes(alumni.userId.toString())  // Changed to userId (without _id)
            };
        });

        res.status(200).json({ alumni: alumniWithStatus });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Alumni by Batch
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
                id: alumni.userId,  // Changed to userId (without _id)
                degree: latestDegree,
                location: alumni.contactInfo?.location || "N/A",
                batch: alumni.batch,
                isConnected: connectedAlumniIds.includes(alumni.userId.toString())  // Changed to userId (without _id)
            };
        });

        res.status(200).json({ alumni: alumniWithStatus });
    } catch (error) {
        console.error("Error fetching alumni:", error);
        res.status(500).json({ error: error.message });
    }
};
