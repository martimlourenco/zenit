const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const BadgeCatalogo = require('../models/BadgeCatalogo');
const Desafio = require('../models/Desafio');
const UserDesafio = require('../models/UserDesafio');
const Recompensa = require('../models/Recompensa');
const HistoricoRecompensa = require('../models/HistoricoRecompensa');
const Modalidade = require('../models/Modalidade');
const Localidade = require('../models/Localidade');
const { Op } = require('sequelize');

exports.getUserBadges = async (req, res) => {
    try {
        const { userId } = req.params;

        const userBadges = await UserBadge.findAll({
            where: { user_id: userId },
            include: [{
                model: BadgeCatalogo,
                as: 'badge'
            }],
            order: [['data_atribuicao', 'DESC']]
        });

        // Badges disponíveis que o utilizador ainda não tem
        const badgesObtidas = userBadges.map(ub => ub.badge_id);
        const badgesDisponiveis = await BadgeCatalogo.findAll({
            where: {
                id: { [Op.notIn]: badgesObtidas }
            }
        });

        res.json({
            badges_obtidas: userBadges,
            badges_disponiveis: badgesDisponiveis
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBadges = async (req, res) => {
    try {
        const badges = await BadgeCatalogo.findAll({
            order: [['tipo', 'ASC'], ['nome', 'ASC']]
        });

        res.json({ badges });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserChallenges = async (req, res) => {
    try {
        const { userId } = req.params;

        // Calcular semana atual
        const hoje = new Date();
        const primeiroDiaSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
        const semanaRef = primeiroDiaSemana.toISOString().split('T')[0];

        const desafiosUtilizador = await UserDesafio.findAll({
            where: { 
                user_id: userId,
                semana_ref: semanaRef
            },
            include: [{
                model: Desafio,
                as: 'desafio'
            }]
        });

        // Se não tem desafios para esta semana, atribuir novos
        if (desafiosUtilizador.length === 0) {
            await this.assignWeeklyChallenges(userId, semanaRef);
            
            // Buscar novamente após atribuição
            const novosDesafios = await UserDesafio.findAll({
                where: { 
                    user_id: userId,
                    semana_ref: semanaRef
                },
                include: [{
                    model: Desafio,
                    as: 'desafio'
                }]
            });

            return res.json({ desafios: novosDesafios });
        }

        res.json({ desafios: desafiosUtilizador });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.completeChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user.id;

        const userDesafio = await UserDesafio.findOne({
            where: {
                user_id: userId,
                desafio_id: challengeId,
                concluido: false
            },
            include: [{
                model: Desafio,
                as: 'desafio'
            }]
        });

        if (!userDesafio) {
            return res.status(404).json({ error: 'Desafio não encontrado ou já concluído' });
        }

        // Marcar como concluído
        await userDesafio.update({ concluido: true });

        // Atribuir pontos ao utilizador
        const user = await User.findByPk(userId);
        user.pontos += userDesafio.desafio.pontos;
        await user.save();

        res.json({ 
            message: 'Desafio concluído com sucesso!',
            pontos_ganhos: userDesafio.desafio.pontos,
            pontos_totais: user.pontos
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { type = 'global' } = req.params;
        const { modalidade_id, localidade_id, limit = 10 } = req.query;

        let whereClause = {};
        let includeClause = [
            { model: Modalidade, as: 'modalidade' },
            { model: Localidade, as: 'localidade_origem' }
        ];

        if (type === 'por_modalidade' && modalidade_id) {
            whereClause.desporto_favorito = modalidade_id;
        }

        if (type === 'por_localidade' && localidade_id) {
            whereClause.localidade = localidade_id;
        }

        const users = await User.findAll({
            where: whereClause,
            include: includeClause,
            attributes: ['id', 'nome', 'username', 'pontos', 'rank'],
            order: [['pontos', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ 
            leaderboard: users,
            type,
            modalidade_id,
            localidade_id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRewards = async (req, res) => {
    try {
        const recompensas = await Recompensa.findAll({
            order: [['custo', 'ASC']]
        });

        res.json({ recompensas });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.purchaseReward = async (req, res) => {
    try {
        const { rewardId } = req.params;
        const userId = req.user.id;

        const recompensa = await Recompensa.findByPk(rewardId);
        if (!recompensa) {
            return res.status(404).json({ error: 'Recompensa não encontrada' });
        }

        const user = await User.findByPk(userId);
        if (user.pontos < recompensa.custo) {
            return res.status(400).json({ error: 'Pontos insuficientes' });
        }

        // Deduzir pontos e registar compra
        user.pontos -= recompensa.custo;
        await user.save();

        await HistoricoRecompensa.create({
            user_id: userId,
            recompensa_id: rewardId,
            data_utilizacao: new Date()
        });

        res.json({ 
            message: 'Recompensa adquirida com sucesso!',
            recompensa,
            pontos_restantes: user.pontos
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Função auxiliar para atribuir desafios semanais
exports.assignWeeklyChallenges = async (userId, semanaRef) => {
    try {
        // Buscar todos os desafios ativos
        const desafiosAtivos = await Desafio.findAll({
            where: { ativo: true },
            order: [['id', 'ASC']]
        });

        if (desafiosAtivos.length === 0) return;

        // Selecionar 2-3 desafios aleatórios
        const numDesafios = Math.min(3, desafiosAtivos.length);
        const desafiosSelecionados = [];
        
        for (let i = 0; i < numDesafios; i++) {
            const randomIndex = Math.floor(Math.random() * desafiosAtivos.length);
            const desafio = desafiosAtivos[randomIndex];
            
            if (!desafiosSelecionados.find(d => d.id === desafio.id)) {
                desafiosSelecionados.push(desafio);
            }
        }

        // Criar registos UserDesafio
        for (const desafio of desafiosSelecionados) {
            await UserDesafio.create({
                user_id: userId,
                desafio_id: desafio.id,
                semana_ref: semanaRef,
                concluido: false
            });
        }

    } catch (error) {
        console.error('Erro ao atribuir desafios semanais:', error);
    }
};
