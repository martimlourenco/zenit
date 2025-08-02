const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Evento = require('./Evento');
const Modalidade = require('./Modalidade');
const Localidade = require('./Localidade');
const Participacao = require('./Participacao');
const Report = require('./Report');
const Penalizacao = require('./Penalizacao');
const BadgeCatalogo = require('./BadgeCatalogo');
const UserBadge = require('./UserBadge');
const Desafio = require('./Desafio');
const UserDesafio = require('./UserDesafio');
const Recompensa = require('./Recompensa');
const HistoricoRecompensa = require('./HistoricoRecompensa');
const Temporada = require('./Temporada');
const Leaderboard = require('./Leaderboard');

// Create models object
const models = {
    User,
    Evento,
    Modalidade,
    Localidade,
    Participacao,
    Report,
    Penalizacao,
    BadgeCatalogo,
    UserBadge,
    Desafio,
    UserDesafio,
    Recompensa,
    HistoricoRecompensa,
    Temporada,
    Leaderboard
};

// Run associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;
