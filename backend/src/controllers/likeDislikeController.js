const LikeDislike = require('../models/LikeDislike');
const Movie = require('../models/Movie');

exports.likeDislikeMovie = async (req, res) => {
    try {
        const { movieId, type } = req.body; // Tipo: "like" ou "dislike"
        const userId = req.user.id;

        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ error: "O tipo deve ser 'like' ou 'dislike'!" });
        }

      
        const movie = await Movie.findOne({ where: { tmdb_id: movieId } });

        if (!movie) {
            return res.status(400).json({ error: "Filme não encontrado!" });
        }

        //  Verificar se já existe um like/dislike para esse filme
        const existingReaction = await LikeDislike.findOne({
            where: { user_id: userId, movie_id: movie.id }
        });

        if (existingReaction) {
            if (existingReaction.type === type) {
                await existingReaction.destroy(); // Remove a reação se for a mesma
                return res.json({ message: `Você removeu seu ${type} do filme.` });
            } else {
                existingReaction.type = type; // Atualiza a reação
                await existingReaction.save();
                return res.json({ message: `Você alterou sua reação para ${type}.` });
            }
        }

        // Criar nova reação
        await LikeDislike.create({ user_id: userId, movie_id: movie.id, type });
        res.json({ message: `Você deu ${type} ao filme!` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// contar total de likes e dislikes de um filme
exports.getMovieReactions = async (req, res) => {
    try {
        const { movieId } = req.params;

        // encontrar o filme pelo `tmdb_id`
        const movie = await Movie.findOne({ where: { tmdb_id: movieId } });

        if (!movie) {
            return res.status(400).json({ error: "Filme não encontrado!" });
        }

        const likes = await LikeDislike.count({ where: { movie_id: movie.id, type: 'like' } });
        const dislikes = await LikeDislike.count({ where: { movie_id: movie.id, type: 'dislike' } });

        res.json({ likes, dislikes });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// listar apenas os filmes que o usuário deu LIKE
exports.getUserLikes = async (req, res) => {
    try {
        const userId = req.user.id;

        const likes = await LikeDislike.findAll({
            where: { user_id: userId, type: 'like' },
            include: [{ model: Movie }]
        });

        res.json({ likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// listar apenas os filmes que o usuário deu DISLIKE
exports.getUserDislikes = async (req, res) => {
    try {
        const userId = req.user.id;

        const dislikes = await LikeDislike.findAll({
            where: { user_id: userId, type: 'dislike' },
            include: [{ model: Movie }]
        });

        res.json({ dislikes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
