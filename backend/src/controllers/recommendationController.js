const Recommendation = require('../models/Recommendation');
const Movie = require('../models/Movie');

exports.sendRecommendation = async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, tmdb_id, message } = req.body;

        // Encontrar o filme na tabela Movie usando o tmdb_id
        const movie = await Movie.findOne({ where: { tmdb_id } });
        if (!movie) {
            return res.status(400).json({ error: "Filme não encontrado no banco de dados!" });
        }

        // Cria a recomendação utilizando o id interno do filme (movie.id)
        const recommendation = await Recommendation.create({
            sender_id,
            receiver_id,
            movie_id: movie.id,
            message
        });

        return res.status(201).json({ message: 'Recomendação enviada com sucesso!', recommendation });
    } catch (error) {
        console.error('Erro ao enviar recomendação:', error);
        return res.status(500).json({ error: 'Erro ao enviar recomendação' });
    }
};

exports.listReceivedRecommendations = async (req, res) => {
    try {
        const receiver_id = req.user.id;

        const recommendations = await Recommendation.findAll({
            where: { receiver_id },
            include: [{ model: Movie }] // Inclui os detalhes do filme
        });

        return res.json(recommendations);
    } catch (error) {
        console.error('Erro ao listar recomendações:', error);
        return res.status(500).json({ error: 'Erro ao listar recomendações' });
    }
};

exports.deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const recommendation = await Recommendation.findByPk(id);

        if (!recommendation) {
            return res.status(404).json({ error: 'Recomendação não encontrada' });
        }

        // Apenas o destinatário autenticado pode deletar a recomendação
        if (recommendation.receiver_id !== req.user.id) {
            return res.status(403).json({ error: 'Você não tem permissão para deletar esta recomendação.' });
        }

        await recommendation.destroy();
        return res.json({ message: 'Recomendação deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar recomendação:', error);
        return res.status(500).json({ error: 'Erro ao deletar recomendação' });
    }
};


exports.countUserRecommendations = async (req, res) => {
    try {
        const receiver_id = req.user.id;
        const count = await Recommendation.count({
            where: { receiver_id }
        });

        return res.json({ count });
    } catch (error) {
        console.error('Erro ao contar recomendações:', error);
        return res.status(500).json({ error: 'Erro ao contar recomendações' });
    }
};