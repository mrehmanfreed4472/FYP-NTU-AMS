const express = require('express');
const { registerAlumni, getAlumniProfile, updateAlumniProfile, deleteAlumniProfile,getAllAlumni } = require('../controllers/alumniController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authMiddleware, registerAlumni);
router.get('/profile/:id', getAlumniProfile);
router.put('/profile', authMiddleware, updateAlumniProfile);
router.delete('/profile', authMiddleware, deleteAlumniProfile);
router.get('/all',getAllAlumni);


module.exports = router;
