const express = require('express');
const { forgotPassword } = require('../controllers/passwordController');

const router = express.Router();

// 🔹 Rota para recuperação de senha
router.post('/forgot-password', forgotPassword);

module.exports = router;
