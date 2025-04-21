const Job = require('../models/Job');
const Alumni = require('../models/Alumni');


exports.createJob = async (req, res) => {
    try {
        const { title, description, category, url } = req.body;
        const thumbnail = req.file ? req.file.filename : null;

        if (!thumbnail) return res.status(400).json({ message: "Thumbnail image is required" });

        const newJob = new Job({ userId: req.user.id, title, description, category, url, thumbnail });
        await newJob.save();

        res.status(201).json({ message: "Job posted successfully", job: newJob });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .sort({ createdAt: -1 })
            .lean();

        const alumniDetails = await Alumni.find({}, 'userId batch experience')
            .populate('userId', 'name')
            .lean();

        const alumniData = alumniDetails.map(alumni => {
            const currentExperience = alumni.experience.filter(exp => exp.isPresent);
            return {
                userId: alumni.userId._id.toString(),
                name: alumni.userId.name,
                batch: alumni.batch,
                companyName: currentExperience.length ? currentExperience[0].companyName : null,
                role: currentExperience.length ? currentExperience[0].role : null
            };
        });

        const response = jobs.map(job => {
            const alumniInfo = alumniData.find(alumni => alumni.userId === job.userId.toString());
            return {
                userId: job.userId,
                name: alumniInfo?.name || null,
                batch: alumniInfo?.batch || null,
                companyName: alumniInfo?.companyName || null,
                role: alumniInfo?.role || null,
                job
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
