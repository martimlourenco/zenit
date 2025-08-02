const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pontos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_gasto: {
    type: DataTypes.NUMERIC,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

// Relações
User.associate = models => {
  User.belongsTo(models.Modalidade, {
    foreignKey: 'desporto_favorito',
    as: 'modalidade',
    onDelete: 'SET NULL'
  });

  User.belongsTo(models.Localidade, {
    foreignKey: 'localidade',
    as: 'localidade_origem',
    onDelete: 'SET NULL'
  });

  User.hasMany(models.Evento, {
    foreignKey: 'organizador_id',
    as: 'eventos_organizados'
  });

  User.hasMany(models.Participacao, {
    foreignKey: 'user_id',
    as: 'participacoes'
  });

  User.hasMany(models.Report, {
    foreignKey: 'reportador_id',
    as: 'reports_feitos'
  });

  User.hasMany(models.Report, {
    foreignKey: 'reportado_id',
    as: 'reports_recebidos'
  });

  User.hasMany(models.UserBadge, {
    foreignKey: 'user_id',
    as: 'badges'
  });

  User.hasMany(models.UserDesafio, {
    foreignKey: 'user_id',
    as: 'desafios'
  });

  User.hasMany(models.HistoricoRecompensa, {
    foreignKey: 'user_id',
    as: 'recompensas_utilizadas'
  });

  User.hasMany(models.Penalizacao, {
    foreignKey: 'user_id',
    as: 'penalizacoes'
  });
};

module.exports = User;
