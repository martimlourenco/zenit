const axios = require('axios');
const Movie = require('../models/Movie');
const { Op } = require("sequelize");
const Genre = require('../models/Genre')
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TOTAL_PAGES = 50; 


async function fetchMoviesFromTMDB(category, page) {
    const url = `https://api.themoviedb.org/3/movie/${category}?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
    const response = await axios.get(url);
    return response.data.results;
}

//  função para popular a base de dados com muitos filmes
async function populateMovies() {
    try {
        console.log("🔄 A procurar filmes da API TMDB...");

        const categories = ['popular', 'top_rated', 'now_playing', 'upcoming'];
        let totalInserted = 0;

        for (const category of categories) {
            for (let page = 1; page <= TOTAL_PAGES; page++) {
                console.log(`🔍 A procurar a página ${page} de ${category}...`);

                const movies = await fetchMoviesFromTMDB(category, page);
                if (!movies || movies.length === 0) break;

                for (const movie of movies) {
                    const releaseDate = movie.release_date && !isNaN(new Date(movie.release_date))
                        ? movie.release_date
                        : null;

                    const [newMovie, created] = await Movie.findOrCreate({
                        where: { tmdb_id: movie.id },
                        defaults: {
                            title: movie.title,
                            overview: movie.overview,
                            release_date: releaseDate,
                            poster_path: movie.poster_path,
                            backdrop_path: movie.backdrop_path,
                            vote_average: movie.vote_average
                        }
                    });

                    // associar os gêneros ao filme
                    if (movie.genre_ids) {
                        const genres = await Genre.findAll({
                            where: { tmdb_id: movie.genre_ids }
                        });
                        await newMovie.setGenres(genres);
                    }

                    if (created) totalInserted++;
                }
            }
        }

        console.log(`🎉 ${totalInserted} novos filmes inseridos na base de dados`);
    } catch (error) {
        console.error("❌ Erro ao popular filmes:", error.message);
    }
}
async function listMovies(req, res) {
    try {
        const movies = await Movie.findAll({
            attributes: ['id', 'tmdb_id', 'title', 'overview', 'release_date', 'poster_path', 'backdrop_path', 'vote_average'],
            include: [{ model: Genre, attributes: ['name'] }], // 🔥 Incluir gêneros
            order: [['release_date', 'DESC']]
        });

        res.json({ movies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMovieDetails(req, res) {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findOne({
            where: { tmdb_id: movieId },
            include: [{ model: Genre, attributes: ['name'] }] 
        });

        if (!movie) {
            return res.status(404).json({ error: "Filme não encontrado na base de dados." });
        }

        return res.json({ movie });

    } catch (error) {
        console.error("❌ Erro ao procurar detalhes do filme:", error);
        res.status(500).json({ error: "Erro ao procurar detalhes do filme." });
    }
}



async function searchMovie(req, res) {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ error: "O título do filme é obrigatório." });
        }

        
        function isComplete(movieData) {
            return (
                movieData.title &&
                movieData.overview &&
                movieData.release_date &&
                movieData.poster_path &&
                movieData.backdrop_path &&
                movieData.vote_average !== null
            );
        }

        
        let localMovies = await Movie.findAll({
            where: {
                title: { [Op.iLike]: `%${title}%` },
            },
        });

        
        localMovies = localMovies.filter((m) => {
            return (
                m.title &&
                m.overview &&
                m.release_date &&
                m.poster_path &&
                m.backdrop_path &&
                m.vote_average !== null
            );
        });

        // Se encontrar algum "completo" no banco, retorna
        if (localMovies.length > 0) {
            return res.json({ movies: localMovies, source: "database" });
        }

        // 2) Se não encontrou no banco, procura na API do TMDB
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(title)}`
        );
        let moviesFromTMDB = response.data.results || [];

        if (moviesFromTMDB.length === 0) {
            
            return res.json({ movies: [], message: "Nenhum filme encontrado." });
        }

        // Filtra para manter apenas os que tiverem todos os campos
        moviesFromTMDB = moviesFromTMDB.filter(isComplete);

        if (moviesFromTMDB.length === 0) {
            // Se todos os filmes da API estiverem incompletos, retorna vazio
            return res.json({ movies: [], message: "Nenhum filme completo encontrado." });
        }

        // 3) guarda cada filme "completo" no banco (evita duplicatas com findOrCreate)
        const moviesToReturn = [];
        for (const movieData of moviesFromTMDB) {
            const [newMovie] = await Movie.findOrCreate({
                where: { tmdb_id: movieData.id },
                defaults: {
                    title: movieData.title,
                    overview: movieData.overview,
                    release_date: movieData.release_date,
                    poster_path: movieData.poster_path,
                    backdrop_path: movieData.backdrop_path,
                    vote_average: movieData.vote_average
                },
            });
            moviesToReturn.push(newMovie);
        }

        return res.json({ movies: moviesToReturn, source: "tmdb" });

    } catch (error) {
        console.error("❌ Erro ao procurar filme:", error);
        res.status(500).json({ error: "Erro ao procurar filme." });
    }
}



module.exports = { populateMovies, listMovies, searchMovie, getMovieDetails };