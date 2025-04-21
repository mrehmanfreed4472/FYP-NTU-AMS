// routes/memoryRoutes.js
const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { createMemory, getAllMemories } = require('../controllers/memoryController');
const router = express.Router();
const authMiddleware=require('../middlewares/authMiddleware');

router.post('/create', upload.single('image'),authMiddleware, createMemory);
router.get('/all', getAllMemories);

module.exports = router;
