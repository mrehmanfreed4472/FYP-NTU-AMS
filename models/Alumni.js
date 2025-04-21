const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    about: String,
    contactInfo: {
        linkedin: String,
        github: String,
        email: String,
        location: String
    },
    skills: [String],
    batch: String,
    experience: [{
        companyName: String,
        startDate: Date,
        endDate: Date,
        isPresent: Boolean,
        description: String,
        role: String
    }],
    education: [{
        universityName: String,
        degree: String,
        startDate: Date,
        endDate: Date,
        isPresent: Boolean
    }],
    projects: [{
        title: String,
        description: String,
        role: String
    }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }]
});

module.exports = mongoose.model('Alumni', AlumniSchema);
