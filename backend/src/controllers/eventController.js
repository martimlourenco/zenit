const Evento = require('../models/Evento');
const Participacao = require('../models/Participacao');
const User = require('../models/User');
const Modalidade = require('../models/Modalidade');
const Localidade = require('../models/Localidade');
const { Op } = require('sequelize');

exports.createEvent = async (req, res) => {
    try {
        const organizadorId = req.user.id;
        const { 
            nome, 
            modalidade, 
            localidade, 
            localizacao, 
            data_hora, 
            min_participantes, 
            max_participantes, 
            preco_total, 
            tipo, 
            pontos_minimos,
            lugares_reservados // Array com nomes das pessoas
        } = req.body;

        // Validações
        if (!nome || !modalidade || !localidade || !data_hora || !min_participantes || !max_participantes || !preco_total || !tipo) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        if (new Date(data_hora) <= new Date()) {
            return res.status(400).json({ error: 'A data do evento deve ser futura' });
        }

        if (min_participantes > max_participantes) {
            return res.status(400).json({ error: 'Número mínimo não pode ser maior que o máximo' });
        }

        // Validar lugares reservados
        if (lugares_reservados && lugares_reservados.length > max_participantes) {
            return res.status(400).json({ 
                error: `Não pode reservar mais lugares (${lugares_reservados.length}) do que o máximo de participantes (${max_participantes})` 
            });
        }

        const evento = await Evento.create({
            nome,
            organizador_id: organizadorId,
            modalidade,
            localidade,
            localizacao,
            data_hora,
            min_participantes,
            max_participantes,
            preco_total,
            tipo,
            pontos_minimos
        });

        // Criar participações para lugares reservados
        const participacoesCriadas = [];
        if (lugares_reservados && lugares_reservados.length > 0) {
            for (const nomeReservado of lugares_reservados) {
                const participacao = await Participacao.create({
                    evento_id: evento.id,
                    user_id: organizadorId, // Organizador que reservou
                    nome_participante: nomeReservado,
                    confirmado: true, // Lugares reservados pelo organizador são sempre confirmados
                    externo: true // Pessoa externa à app
                });
                participacoesCriadas.push(participacao);
            }
        }

        // Incluir informações das reservas na resposta
        const responseData = {
            message: 'Evento criado com sucesso!', 
            evento,
            lugares_reservados: participacoesCriadas.length,
            lugares_disponiveis: max_participantes - participacoesCriadas.length
        };

        if (participacoesCriadas.length > 0) {
            responseData.reservas = participacoesCriadas;
        }

        res.status(201).json(responseData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { 
            modalidade_id, 
            localidade_id, 
            data_inicio, 
            data_fim, 
            tipo, 
            status = 'pendente,confirmado',
            page = 1,
            limit = 10
        } = req.query;

        const where = {};
        
        // Filtros
        if (modalidade_id) where.modalidade = modalidade_id;
        if (localidade_id) where.localidade = localidade_id;
        if (tipo) where.tipo = tipo;
        if (status) where.status = { [Op.in]: status.split(',') };
        
        if (data_inicio && data_fim) {
            where.data_hora = {
                [Op.between]: [new Date(data_inicio), new Date(data_fim)]
            };
        } else if (data_inicio) {
            where.data_hora = { [Op.gte]: new Date(data_inicio) };
        }

        const offset = (page - 1) * limit;

        const eventos = await Evento.findAndCountAll({
            where,
            include: [
                { model: User, as: 'organizador', attributes: ['id', 'nome', 'username'] },
                { model: Modalidade, as: 'modalidade_info' },
                { model: Localidade, as: 'localidade_info' },
                { 
                    model: Participacao, 
                    as: 'participacoes',
                    where: { confirmado: true },
                    required: false,
                    include: [{ model: User, as: 'utilizador', attributes: ['id', 'nome'] }]
                }
            ],
            order: [['data_hora', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            eventos: eventos.rows,
            total: eventos.count,
            pages: Math.ceil(eventos.count / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;

        const evento = await Evento.findByPk(eventId, {
            include: [
                { model: User, as: 'organizador', attributes: ['id', 'nome', 'username', 'pontos', 'rank'] },
                { model: Modalidade, as: 'modalidade_info' },
                { model: Localidade, as: 'localidade_info' },
                { 
                    model: Participacao, 
                    as: 'participacoes',
                    include: [{ model: User, as: 'utilizador', attributes: ['id', 'nome', 'username'] }]
                }
            ]
        });

        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        res.json({ evento });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const { lugares_reservados, ...updateData } = req.body;

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.organizador_id !== userId) {
            return res.status(403).json({ error: 'Apenas o organizador pode editar o evento' });
        }

        if (evento.status === 'cancelado' || evento.status === 'concluido') {
            return res.status(400).json({ error: 'Não é possível editar eventos cancelados ou concluídos' });
        }

        // Validações para campos específicos se fornecidos
        if (updateData.data_hora && new Date(updateData.data_hora) <= new Date()) {
            return res.status(400).json({ error: 'A data do evento deve ser futura' });
        }

        if (updateData.min_participantes && updateData.max_participantes && 
            updateData.min_participantes > updateData.max_participantes) {
            return res.status(400).json({ error: 'Número mínimo não pode ser maior que o máximo' });
        }

        if (updateData.min_participantes && evento.max_participantes && 
            updateData.min_participantes > evento.max_participantes) {
            return res.status(400).json({ error: 'Número mínimo não pode ser maior que o máximo atual' });
        }

        if (updateData.max_participantes && evento.min_participantes && 
            updateData.max_participantes < evento.min_participantes) {
            return res.status(400).json({ error: 'Número máximo não pode ser menor que o mínimo atual' });
        }

        // Verificar se o novo max_participantes não é menor que participantes já confirmados
        if (updateData.max_participantes) {
            const participantesConfirmados = await Participacao.count({
                where: { evento_id: eventId, confirmado: true }
            });

            if (updateData.max_participantes < participantesConfirmados) {
                return res.status(400).json({ 
                    error: `Não pode reduzir máximo para ${updateData.max_participantes}. Já existem ${participantesConfirmados} participantes confirmados.` 
                });
            }
        }

        // Se lugares_reservados foi fornecido, gerir as reservas
        if (lugares_reservados !== undefined) {
            // Contar participantes reais (não reservados)
            const participantesReais = await Participacao.count({
                where: { 
                    evento_id: eventId, 
                    confirmado: true,
                    externo: false 
                }
            });

            // Verificar se há espaço para as reservas considerando participantes reais
            const maxParticipantes = updateData.max_participantes || evento.max_participantes;
            const totalLugaresNecessarios = participantesReais + lugares_reservados.length;

            if (totalLugaresNecessarios > maxParticipantes) {
                return res.status(400).json({ 
                    error: `Não há lugares suficientes. Participantes inscritos: ${participantesReais}, tentando reservar: ${lugares_reservados.length}, máximo: ${maxParticipantes}` 
                });
            }

            // Remover todas as reservas antigas (apenas externas)
            await Participacao.destroy({
                where: { 
                    evento_id: eventId, 
                    externo: true 
                }
            });

            // Criar novas reservas
            const novasReservas = [];
            for (const nomeReservado of lugares_reservados) {
                if (nomeReservado && nomeReservado.trim()) { // Só criar se nome não estiver vazio
                    const participacao = await Participacao.create({
                        evento_id: eventId,
                        user_id: userId, // Organizador que reservou
                        nome_participante: nomeReservado.trim(),
                        confirmado: true,
                        externo: true
                    });
                    novasReservas.push(participacao);
                }
            }
        }

        // Atualizar dados do evento (todos os campos fornecidos)
        await evento.update(updateData);

        // Buscar evento atualizado com participações
        const eventoAtualizado = await Evento.findByPk(eventId, {
            include: [
                { model: User, as: 'organizador', attributes: ['id', 'nome', 'username', 'pontos'] },
                { model: Modalidade, as: 'modalidade_info' },
                { model: Localidade, as: 'localidade_info' },
                { 
                    model: Participacao, 
                    as: 'participacoes',
                    include: [{ model: User, as: 'utilizador', attributes: ['id', 'nome', 'username'] }]
                }
            ]
        });

        // Calcular estatísticas
        const participantesReais = await Participacao.count({
            where: { evento_id: eventId, confirmado: true, externo: false }
        });
        const lugaresReservados = await Participacao.count({
            where: { evento_id: eventId, externo: true }
        });

        res.json({ 
            message: 'Evento atualizado com sucesso!', 
            evento: eventoAtualizado,
            estatisticas: {
                participantes_inscritos: participantesReais,
                lugares_reservados: lugaresReservados,
                lugares_disponiveis: eventoAtualizado.max_participantes - participantesReais - lugaresReservados
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.organizador_id !== userId) {
            return res.status(403).json({ error: 'Apenas o organizador pode cancelar o evento' });
        }

        await evento.update({ status: 'cancelado' });

        res.json({ message: 'Evento cancelado com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.joinEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const { nome_participante } = req.body; // Para participantes externos

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.status !== 'pendente' && evento.status !== 'confirmado') {
            return res.status(400).json({ error: 'Não é possível inscrever-se neste evento' });
        }

        // Verificar pontos mínimos
        const user = await User.findByPk(userId);
        if (evento.pontos_minimos && user.pontos < evento.pontos_minimos) {
            return res.status(400).json({ 
                error: `Pontos insuficientes. Necessário: ${evento.pontos_minimos}, possui: ${user.pontos}` 
            });
        }

        // Verificar se já está inscrito
        const participacaoExistente = await Participacao.findOne({
            where: { evento_id: eventId, user_id: userId }
        });

        if (participacaoExistente) {
            return res.status(400).json({ error: 'Já está inscrito neste evento' });
        }

        // Verificar limite de participantes
        const participantesConfirmados = await Participacao.count({
            where: { evento_id: eventId, confirmado: true }
        });

        if (participantesConfirmados >= evento.max_participantes) {
            return res.status(400).json({ error: 'Evento lotado' });
        }

        const participacao = await Participacao.create({
            evento_id: eventId,
            user_id: userId,
            nome_participante,
            confirmado: evento.tipo === 'aberto',
            pedido_pendente: evento.tipo === 'por convite'
        });

        res.status(201).json({ 
            message: evento.tipo === 'aberto' ? 'Inscrito com sucesso!' : 'Pedido de participação enviado!',
            participacao 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.leaveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const participacao = await Participacao.findOne({
            where: { evento_id: eventId, user_id: userId }
        });

        if (!participacao) {
            return res.status(404).json({ error: 'Não está inscrito neste evento' });
        }

        await participacao.destroy();

        res.json({ message: 'Desinscrito com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;

        const participacoes = await Participacao.findAll({
            where: { evento_id: eventId },
            include: [{ 
                model: User, 
                as: 'utilizador', 
                attributes: ['id', 'nome', 'username', 'pontos', 'rank'] 
            }],
            order: [['data_inscricao', 'ASC']]
        });

        res.json({ participacoes });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { user_id } = req.body;
        const organizadorId = req.user.id;

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.organizador_id !== organizadorId) {
            return res.status(403).json({ error: 'Apenas o organizador pode convidar utilizadores' });
        }

        // Verificar se já está convidado
        const conviteExistente = await Participacao.findOne({
            where: { evento_id: eventId, user_id }
        });

        if (conviteExistente) {
            return res.status(400).json({ error: 'Utilizador já foi convidado' });
        }

        const participacao = await Participacao.create({
            evento_id: eventId,
            user_id,
            convidado: true,
            pedido_pendente: true
        });

        res.status(201).json({ 
            message: 'Convite enviado com sucesso!',
            participacao 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveParticipant = async (req, res) => {
    try {
        const { eventId, participationId } = req.params;
        const organizadorId = req.user.id;

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.organizador_id !== organizadorId) {
            return res.status(403).json({ error: 'Apenas o organizador pode aprovar participações' });
        }

        const participacao = await Participacao.findByPk(participationId);
        
        if (!participacao || participacao.evento_id !== eventId) {
            return res.status(404).json({ error: 'Participação não encontrada' });
        }

        await participacao.update({
            confirmado: true,
            pedido_pendente: false
        });

        res.json({ 
            message: 'Participação aprovada!',
            participacao 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectParticipant = async (req, res) => {
    try {
        const { eventId, participationId } = req.params;
        const organizadorId = req.user.id;

        const evento = await Evento.findByPk(eventId);
        
        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        if (evento.organizador_id !== organizadorId) {
            return res.status(403).json({ error: 'Apenas o organizador pode rejeitar participações' });
        }

        const participacao = await Participacao.findByPk(participationId);
        
        if (!participacao || participacao.evento_id !== eventId) {
            return res.status(404).json({ error: 'Participação não encontrada' });
        }

        await participacao.destroy();

        res.json({ message: 'Participação rejeitada!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
