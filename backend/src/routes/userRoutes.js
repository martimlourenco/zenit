const express = require('express');
const { changePassword } = require('../controllers/userController');
const { getUserDetails } = require("../controllers/userController");
const { searchUser } = require("../controllers/userController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Rota protegida para mudar a senha
router.put('/change-password', authMiddleware, changePassword);
router.get("/profile/:userId", getUserDetails);
router.get("/search", searchUser);
module.exports = router;
