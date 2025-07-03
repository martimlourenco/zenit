const express = require('express');
const { register, login, getUserDetails, updateUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getUserDetails);  
router.put('/me', authMiddleware, updateUser);  

module.exports = router;
