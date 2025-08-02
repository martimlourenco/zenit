const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Penalizacao = sequelize.define('Penalizacao', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  report_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  tipo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pontos_perdidos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  data_penalizacao: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'penalizacoes',
  timestamps: false
});

Penalizacao.associate = models => {
  Penalizacao.belongsTo(models.User, { 
    foreignKey: 'user_id', 
    as: 'user',
    onDelete: 'CASCADE'
  });
  Penalizacao.belongsTo(models.Report, { 
    foreignKey: 'report_id', 
    as: 'report',
    onDelete: 'SET NULL'
  });
};

module.exports = Penalizacao;
