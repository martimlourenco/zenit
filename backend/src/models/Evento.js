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
  pontos_minimos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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
    as: 'organizador',
    onDelete: 'SET NULL'
  });

  Evento.belongsTo(models.Modalidade, {
    foreignKey: 'modalidade',
    as: 'modalidade_info',
    onDelete: 'SET NULL'
  });

  Evento.belongsTo(models.Localidade, {
    foreignKey: 'localidade',
    as: 'localidade_info',
    onDelete: 'SET NULL'
  });

  Evento.hasMany(models.Participacao, {
    foreignKey: 'evento_id',
    as: 'participacoes'
  });

  Evento.hasMany(models.Report, {
    foreignKey: 'evento_id',
    as: 'reports'
  });
};

module.exports = Evento;
