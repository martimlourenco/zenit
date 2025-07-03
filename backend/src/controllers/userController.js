const bcrypt = require('bcrypt');
const User = require('../models/User');
const { Op } = require("sequelize");
const Favorite = require("../models/Favorite");
const LikeDislike = require("../models/LikeDislike");
const Movie = require('../models/Movie'); 

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // ✅ Verificar se a nova senha e a confirmação são iguais
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "As novas senhas não coincidem!" });
        }

        // ✅ Buscar o usuário no banco de dados
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado!" });
        }

        // ✅ Verificar se a senha atual está correta
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Senha atual incorreta!" });
        }

        // ✅ Hash da nova senha e salvar no banco de dados
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Senha alterada com sucesso!" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.searchUser = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "O nome ou username é obrigatório." });
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { username: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ["id", "name", "username", "email"]
        });

        if (users.length === 0) {
            return res.status(404).json({ error: "Nenhum utilizador encontrado." });
        }

        res.json({ users });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: ["id", "name", "username", "email"]
        });

        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        // Buscar favoritos do usuário
        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{ model: Movie }]
        });

        // Buscar likes do usuário
        const likes = await LikeDislike.findAll({
            where: { user_id: userId, type: "like" },
            include: [{ model: Movie }]
        });

        // Buscar dislikes do usuário
        const dislikes = await LikeDislike.findAll({
            where: { user_id: userId, type: "dislike" },
            include: [{ model: Movie }]
        });

        res.json({ user, favorites, likes, dislikes });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};