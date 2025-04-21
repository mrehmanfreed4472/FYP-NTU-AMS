const express = require('express');
const router = express.Router();
const { connectAlumni, getAllAlumniWithStatus ,getAlumniByDegree,getAlumniByBatch} = require('../controllers/connectionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/connect', authMiddleware, connectAlumni);
router.get('/connections', authMiddleware, getAllAlumniWithStatus);
router.get('/batch', authMiddleware, getAlumniByBatch);
router.get('/degree', authMiddleware, getAlumniByDegree);

module.exports = router;
