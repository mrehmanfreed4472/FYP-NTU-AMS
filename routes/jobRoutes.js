// routes/jobRoutes.js
const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { createJob, getAllJobs } = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/create', upload.single('thumbnail'),authMiddleware, createJob);
router.get('/all', getAllJobs);

module.exports = router;
