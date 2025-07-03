const express = require('express');
const { listMovies, populateMovies, searchMovie, getMovieDetails } = require('../controllers/movieController');

const router = express.Router();

// 🔹 Rota para popular o banco com filmes do TMDB
router.get('/populate', populateMovies);
router.get('/list', listMovies);
router.get('/search', searchMovie);
router.get('/details/:movieId', getMovieDetails); // ✅ Nova rota para detalhes do filme

module.exports = router;
