const express = require('express');
const { addFavorite, getFavorites, removeFavorite } = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rota protegida: usuário precisa estar autenticado para gerenciar favoritos
router.post('/add', authMiddleware, addFavorite);
router.get('/', authMiddleware, getFavorites);
router.delete('/remove', authMiddleware, removeFavorite);

module.exports = router;
