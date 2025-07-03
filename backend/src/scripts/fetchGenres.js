const axios = require('axios');
const Genre = require('../models/Genre');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchGenres() {
    try {
        console.log("🔄 Generos do TMDB...");
        const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=pt-BR`;
        const response = await axios.get(url);
        const genres = response.data.genres;

        for (const genre of genres) {
            await Genre.findOrCreate({
                where: { tmdb_id: genre.id },
                defaults: { name: genre.name }
            });
        }

        console.log("✅ Generos guardados na base de dados!");
    } catch (error) {
        console.error("❌ Erro ao procurar generos:", error.message);
    }
}

module.exports = fetchGenres;