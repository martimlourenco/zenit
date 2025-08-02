const express = require('express');
const { 
    createReport, 
    getReports,
    getReportById,
    getUserReports
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Criar report
router.post('/', authMiddleware, createReport);

// Listar reports (admin)
router.get('/', authMiddleware, getReports);

// Ver report específico
router.get('/:reportId', authMiddleware, getReportById);

// Reports de um utilizador
router.get('/user/:userId', authMiddleware, getUserReports);

module.exports = router;
