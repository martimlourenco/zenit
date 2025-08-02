const express = require('express');
const { changePassword, getUserDetails, searchUser, getUserStats, getMyProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Perfil do utilizador autenticado
router.get('/profile', authMiddleware, getMyProfile);

// Mudança de password
router.put('/change-password', authMiddleware, changePassword);

// Perfil público de utilizador
router.get('/profile/:userId', getUserDetails);

// Pesquisa de utilizadores
router.get('/search', searchUser);

// Estatísticas do utilizador
router.get('/stats/:userId', getUserStats);

module.exports = router;
