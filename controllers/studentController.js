const Student = require('../models/Student');

// Register Student
exports.registerStudent = async (req, res) => {
    try {
        const existingStudent = await Student.findOne({ userId: req.user.id });
        if (existingStudent) return res.status(400).json({ message: "Student profile already exists" });

        const newStudent = new Student({ userId: req.user.id, ...req.body });
        await newStudent.save();

        res.status(201).json({ message: "Student profile created successfully", newStudent });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Student Profile
exports.getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findOne({ userId: id }).populate('userId', 'name email');
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update Student Profile
exports.updateStudentProfile = async (req, res) => {
    try {
        const updatedStudent = await Student.findOneAndUpdate({ userId: req.user.id }, req.body, { new: true });
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete Student Profile
exports.deleteStudentProfile = async (req, res) => {
    try {
        await Student.findOneAndDelete({ userId: req.user.id });
        res.json({ message: "Student profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get All Students with Pagination
exports.getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const students = await Student.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'name')
            .select('batch education');

        const formatted = students.map(student => {
            const latestEdu = student.education.length > 0
                ? student.education[student.education.length - 1]
                : null;

            return {
                id: student.userId,  // Changed to userId (without _id)
                name: student.userId?.name || "Unknown",
                batch: student.batch || "N/A",
                degree: latestEdu?.degree || "N/A",
                university: latestEdu?.universityName || "N/A"
            };
        });

        const total = await Student.countDocuments();

        res.json({
            totalStudents: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            students: formatted
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Students by Degree
exports.getStudentsByDegree = async (req, res) => {
    try {
        const { degree } = req.query;
        if (!degree) return res.status(400).json({ message: "Degree is required" });

        const userStudent = await Student.findOne({ userId: req.user.id });
        if (!userStudent) return res.status(404).json({ message: "Student profile not found" });

        const allStudents = await Student.find({
            userId: { $ne: req.user.id },
            "education.degree": degree
        })
            .select('_id userId contactInfo education')
            .populate('userId', 'name');

        const connectedIds = userStudent.connections.map(id => id.toString());

        const result = allStudents.map(student => {
            const latestDegree = student.education.length > 0
                ? student.education[student.education.length - 1].degree
                : "N/A";

            return {
                name: student.userId.name,
                id: student.userId,  // Changed to userId (without _id)
                degree: latestDegree,
                location: student.contactInfo?.location || "N/A",
                isConnected: connectedIds.includes(student.userId.toString())  // Changed to userId (without _id)
            };
        });

        res.status(200).json({ students: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Students by Batch
exports.getStudentsByBatch = async (req, res) => {
    try {
        const { batch } = req.query;
        if (!batch) return res.status(400).json({ message: "Batch is required" });

        const userStudent = await Student.findOne({ userId: req.user.id });
        if (!userStudent) return res.status(404).json({ message: "Student profile not found" });

        const allStudents = await Student.find({
            userId: { $ne: req.user.id },
            batch
        })
            .select('_id userId contactInfo education batch')
            .populate('userId', 'name');

        const connectedIds = userStudent.connections.map(id => id.toString());

        const result = allStudents.map(student => {
            const latestDegree = student.education.length > 0
                ? student.education[student.education.length - 1].degree
                : "N/A";

            return {
                name: student.userId.name,
                id: student.userId,  // Changed to userId (without _id)
                degree: latestDegree,
                location: student.contactInfo?.location || "N/A",
                batch: student.batch,
                isConnected: connectedIds.includes(student.userId.toString())  // Changed to userId (without _id)
            };
        });

        res.status(200).json({ students: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
