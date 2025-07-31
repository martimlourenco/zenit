const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participacao = sequelize.define('Participacao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome_participante: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  convidado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pedido_pendente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  externo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_inscricao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'participacoes',
  timestamps: false
});

// Relações
Participacao.associate = models => {
  Participacao.belongsTo(models.Evento, {
    foreignKey: 'evento_id',
    as: 'evento'
  });

  Participacao.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'utilizador',
    allowNull: true
  });
};

module.exports = Participacao;
