const Report = require('../models/Report');
const User = require('../models/User');
const Evento = require('../models/Evento');
const Participacao = require('../models/Participacao');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.createReport = async (req, res) => {
    try {
        const reportadorId = req.user.id;
        const { reportado_id, evento_id, tipo, descricao } = req.body;

        // Validações
        if (!reportado_id || !evento_id || !tipo) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        if (reportadorId === reportado_id) {
            return res.status(400).json({ error: 'Não pode reportar-se a si mesmo' });
        }

        // Verificar se o evento existe e já aconteceu
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const agora = new Date();
        const eventoData = new Date(evento.data_hora);
        const duasHorasAposEvento = new Date(eventoData.getTime() + (2 * 60 * 60 * 1000));

        if (agora > duasHorasAposEvento) {
            return res.status(400).json({ error: 'Reports só podem ser feitos até 2 horas após o evento' });
        }

        // Verificar se ambos participaram do evento
        const participacaoReportador = await Participacao.findOne({
            where: { evento_id, user_id: reportadorId, confirmado: true }
        });

        const participacaoReportado = await Participacao.findOne({
            where: { evento_id, user_id: reportado_id, confirmado: true }
        });

        if (!participacaoReportador) {
            return res.status(403).json({ error: 'Só pode reportar utilizadores de eventos onde participou' });
        }

        if (!participacaoReportado) {
            return res.status(400).json({ error: 'O utilizador reportado não participou neste evento' });
        }

        // Verificar se já existe um report do mesmo tipo para este evento
        const reportExistente = await Report.findOne({
            where: {
                reportador_id: reportadorId,
                reportado_id,
                evento_id,
                tipo
            }
        });

        if (reportExistente) {
            return res.status(400).json({ error: 'Já reportou este utilizador por este motivo neste evento' });
        }

        const report = await Report.create({
            reportador_id: reportadorId,
            reportado_id,
            evento_id,
            tipo,
            descricao
        });

        // Verificar se deve aplicar penalizações automáticas
        await this.checkAndApplyPenalties(reportado_id, tipo);

        res.status(201).json({ 
            message: 'Report criado com sucesso!',
            report 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { 
            reportado_id, 
            tipo, 
            data_inicio, 
            data_fim,
            page = 1,
            limit = 10
        } = req.query;

        const where = {};
        
        if (reportado_id) where.reportado_id = reportado_id;
        if (tipo) where.tipo = tipo;
        
        if (data_inicio && data_fim) {
            where.data_report = {
                [Op.between]: [new Date(data_inicio), new Date(data_fim)]
            };
        }

        const offset = (page - 1) * limit;

        const reports = await Report.findAndCountAll({
            where,
            include: [
                { model: User, as: 'reportador', attributes: ['id', 'nome', 'username'] },
                { model: User, as: 'reportado', attributes: ['id', 'nome', 'username'] },
                { model: Evento, as: 'evento', attributes: ['id', 'nome', 'data_hora'] }
            ],
            order: [['data_report', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            reports: reports.rows,
            total: reports.count,
            pages: Math.ceil(reports.count / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findByPk(reportId, {
            include: [
                { model: User, as: 'reportador', attributes: ['id', 'nome', 'username'] },
                { model: User, as: 'reportado', attributes: ['id', 'nome', 'username'] },
                { model: Evento, as: 'evento' }
            ]
        });

        if (!report) {
            return res.status(404).json({ error: 'Report não encontrado' });
        }

        res.json({ report });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tipo } = req.query;

        const where = { reportado_id: userId };
        if (tipo) where.tipo = tipo;

        const reports = await Report.findAll({
            where,
            include: [
                { model: User, as: 'reportador', attributes: ['id', 'nome', 'username'] },
                { model: Evento, as: 'evento', attributes: ['id', 'nome', 'data_hora'] }
            ],
            order: [['data_report', 'DESC']]
        });

        // Contar reports por tipo
        const reportStats = await Report.findAll({
            where: { reportado_id: userId },
            attributes: [
                'tipo',
                [sequelize.fn('COUNT', sequelize.col('tipo')), 'count']
            ],
            group: ['tipo']
        });

        res.json({ 
            reports,
            stats: reportStats
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Função auxiliar para verificar e aplicar penalizações
exports.checkAndApplyPenalties = async (userId, tipoReport) => {
    try {
        const Penalizacao = require('../models/Penalizacao');
        
        // Contar reports do mesmo tipo nos últimos 30 dias
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        const reportsRecentes = await Report.count({
            where: {
                reportado_id: userId,
                tipo: tipoReport,
                data_report: { [Op.gte]: trintaDiasAtras }
            }
        });

        // Definir penalizações baseadas no número de reports
        let penalizacao = null;
        
        if (reportsRecentes >= 5) {
            penalizacao = {
                tipo: 'suspensao_temporaria',
                descricao: `Suspensão de 7 dias por ${reportsRecentes} reports de ${tipoReport}`,
                pontos_perdidos: 50
            };
        } else if (reportsRecentes >= 3) {
            penalizacao = {
                tipo: 'perda_pontos',
                descricao: `Perda de pontos por ${reportsRecentes} reports de ${tipoReport}`,
                pontos_perdidos: 20
            };
        }

        if (penalizacao) {
            await Penalizacao.create({
                user_id: userId,
                tipo: penalizacao.tipo,
                descricao: penalizacao.descricao,
                pontos_perdidos: penalizacao.pontos_perdidos,
                data_penalizacao: new Date()
            });

            // Atualizar pontos do utilizador
            const user = await User.findByPk(userId);
            if (user && penalizacao.pontos_perdidos) {
                user.pontos = Math.max(0, user.pontos - penalizacao.pontos_perdidos);
                await user.save();
            }
        }

    } catch (error) {
        console.error('Erro ao aplicar penalizações:', error);
    }
};
