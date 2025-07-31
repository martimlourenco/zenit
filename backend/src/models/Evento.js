const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  localizacao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  local_reservado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_hora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  min_participantes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_participantes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  preco_total: {
    type: DataTypes.NUMERIC,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('aberto', 'por convite'),
    allowNull: false
  },
  rank_minimo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'concluido'),
    defaultValue: 'pendente'
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'eventos',
  timestamps: false
});

// Relações
Evento.associate = models => {
  Evento.belongsTo(models.User, {
    foreignKey: 'organizador_id',
    as: 'organizador'
  });

  Evento.belongsTo(models.Modalidade, {
    foreignKey: 'modalidade',
    as: 'modalidade'
  });

  Evento.belongsTo(models.Localidade, {
    foreignKey: 'localidade',
    as: 'localidade_evento'
  });

  Evento.hasMany(models.Participacao, {
    foreignKey: 'evento_id',
    as: 'participacoes'
  });
};

module.exports = Evento;
