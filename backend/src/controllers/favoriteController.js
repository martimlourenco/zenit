const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

exports.addFavorite = async (req, res) => {
    try {
        const { movieId } = req.body; // movieId é o tmdb_id do filme
        const userId = req.user.id; 

        // encontrar pelo tmbd
        const movie = await Movie.findOne({ where: { tmdb_id: movieId } });

        if (!movie) {
            return res.status(400).json({ error: "Filme não encontrado na base de dados!" });
        }

        //  usar o `id` da base de dados, não o `tmdb_id`
        const [favorite, created] = await Favorite.findOrCreate({
            where: { user_id: userId, movie_id: movie.id }
        });

        if (!created) {
            return res.status(400).json({ error: "Filme já está nos favoritos!" });
        }

        res.json({ message: "Filme adicionado aos favoritos!" });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{ model: Movie }] //  Inclui os detalhes do filme corretamente
        });

        res.json({ favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { movieId } = req.body; 
        const userId = req.user.id;   

        // Encontrar o filme na base de dados pelo tmdb_id
        const movie = await Movie.findOne({ where: { tmdb_id: movieId } });
        if (!movie) {
            return res.status(400).json({ error: "Filme não encontrado na base de dados!" });
        }

        
        const favorite = await Favorite.findOne({ 
            where: { user_id: userId, movie_id: movie.id } 
        });

        if (!favorite) {
            return res.status(400).json({ error: "Filme não está nos favoritos!" });
        }

        await favorite.destroy();
        res.json({ message: "Filme removido dos favoritos com sucesso!" });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
