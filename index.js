
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const studentRoutes = require('./routes/studentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const connectRoutes = require('./routes/connectRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/chat', chatRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hi, Backend is active" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
