const express = require('express');
const {
    registerStudent,
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    getAllStudents,
    getStudentsByDegree,
    getStudentsByBatch
} = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authMiddleware, registerStudent);
router.get('/profile/:id', getStudentProfile);
router.put('/profile', authMiddleware, updateStudentProfile);
router.delete('/profile', authMiddleware, deleteStudentProfile);
router.get('/all', getAllStudents);
router.get('/by-degree', authMiddleware, getStudentsByDegree);
router.get('/by-batch', authMiddleware, getStudentsByBatch);

module.exports = router;
