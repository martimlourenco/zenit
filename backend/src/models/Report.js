const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  reportador_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reportado_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('nao_comparencia', 'atraso', 'ma_conduta'),
    allowNull: false
  },
  evento_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_report: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reports',
  timestamps: false
});

// Relações
Report.associate = models => {
  Report.belongsTo(models.User, {
    foreignKey: 'reportador_id',
    as: 'reportador',
    onDelete: 'SET NULL'
  });

  Report.belongsTo(models.User, {
    foreignKey: 'reportado_id',
    as: 'reportado',
    onDelete: 'SET NULL'
  });

  Report.belongsTo(models.Evento, {
    foreignKey: 'evento_id',
    as: 'evento',
    onDelete: 'CASCADE'
  });

  Report.hasMany(models.Penalizacao, {
    foreignKey: 'report_id',
    as: 'penalizacoes'
  });
};

module.exports = Report;
