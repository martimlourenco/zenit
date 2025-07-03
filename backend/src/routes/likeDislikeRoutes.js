const express = require('express');
const { likeDislikeMovie, getMovieReactions, getUserLikes, getUserDislikes } = require('../controllers/likeDislikeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Rota para dar like/dislike
router.post('/', authMiddleware, likeDislikeMovie);
// ✅ Rota para listar apenas os filmes curtidos pelo usuário
router.get('/my-likes', authMiddleware, getUserLikes);

// ✅ Rota para listar apenas os filmes que o usuário deu dislike
router.get('/my-dislikes', authMiddleware, getUserDislikes);
// ✅ Rota para pegar total de likes e dislikes de um filme específico
router.get('/:movieId', getMovieReactions);



module.exports = router;
