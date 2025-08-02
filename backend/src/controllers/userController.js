const bcrypt = require('bcrypt');
const User = require('../models/User');
const { Op } = require("sequelize");
const Evento = require('../models/Evento');
const Participacao = require('../models/Participacao');
const Modalidade = require('../models/Modalidade');
const Localidade = require('../models/Localidade');

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "As novas senhas não coincidem!" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado!" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Senha atual incorreta!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Senha alterada com sucesso!" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ["id", "nome", "username", "email", "pontos", "total_gasto", "created_at"],
            include: [
                { model: Modalidade, as: 'modalidade' },
                { model: Localidade, as: 'localidade_origem' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        res.json({ user });

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
                    { nome: { [Op.iLike]: `%${query}%` } },
                    { username: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ["id", "nome", "username", "email", "pontos", "rank"],
            include: [
                { model: Modalidade, as: 'modalidade' },
                { model: Localidade, as: 'localidade_origem' }
            ]
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
            attributes: ["id", "nome", "username", "email", "pontos", "rank", "total_gasto", "created_at"],
            include: [
                { model: Modalidade, as: 'modalidade' },
                { model: Localidade, as: 'localidade_origem' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        res.json({ user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        // Eventos organizados
        const eventosOrganizados = await Evento.count({
            where: { organizador_id: userId }
        });

        // Eventos participados
        const eventosParticipados = await Participacao.count({
            where: { user_id: userId, confirmado: true }
        });

        // Eventos concluídos com sucesso
        const eventosConcluidos = await Evento.count({
            where: { 
                organizador_id: userId,
                status: 'concluido'
            }
        });

        // Modalidade mais praticada
        const modalidadeMaisPraticada = await Participacao.findAll({
            where: { user_id: userId, confirmado: true },
            include: [{
                model: Evento,
                as: 'evento',
                include: [{
                    model: Modalidade,
                    as: 'modalidade'
                }]
            }]
        });

        const modalidadesCount = {};
        modalidadeMaisPraticada.forEach(p => {
            const modalidade = p.evento.modalidade.nome;
            modalidadesCount[modalidade] = (modalidadesCount[modalidade] || 0) + 1;
        });

        const modalidadeFavorita = Object.keys(modalidadesCount).reduce((a, b) => 
            modalidadesCount[a] > modalidadesCount[b] ? a : b, null
        );

        res.json({
            user: {
                id: user.id,
                nome: user.nome,
                pontos: user.pontos,
                rank: user.rank,
                total_gasto: user.total_gasto
            },
            stats: {
                eventos_organizados: eventosOrganizados,
                eventos_participados: eventosParticipados,
                eventos_concluidos: eventosConcluidos,
                modalidade_favorita: modalidadeFavorita,
                modalidades_praticadas: modalidadesCount
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};