// routes/recommendationRoutes.js

const express = require('express');
const { sendRecommendation, listReceivedRecommendations, deleteRecommendation, countUserRecommendations } = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Enviar uma recomendação (precisa de autenticação)
router.post('/', authMiddleware, sendRecommendation);

// Listar recomendações recebidas (precisa de autenticação)
router.get('/received', authMiddleware, listReceivedRecommendations);

// Deletar uma recomendação específica (precisa de autenticação)
router.delete('/:id', authMiddleware, deleteRecommendation);

// Contar recomendações do usuário autenticado
router.get('/received/count', authMiddleware, countUserRecommendations);

module.exports = router;
