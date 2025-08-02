const express = require('express');
const { 
    getUserBadges,
    getAllBadges,
    getUserChallenges,
    completeChallenge,
    getLeaderboard,
    getRewards,
    purchaseReward
} = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Badges
router.get('/badges/:userId', getUserBadges);
router.get('/badges', getAllBadges);

// Desafios
router.get('/challenges/:userId', authMiddleware, getUserChallenges);
router.put('/challenges/:challengeId/complete', authMiddleware, completeChallenge);

// Leaderboards
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/:type', getLeaderboard);

// Recompensas
router.get('/rewards', getRewards);
router.post('/rewards/:rewardId/purchase', authMiddleware, purchaseReward);

module.exports = router;
