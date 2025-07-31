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
    type: DataTypes.ENUM('faltou', 'atrasado', 'mentiu_evento'),
    allowNull: false
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
    as: 'reportador'
  });

  Report.belongsTo(models.User, {
    foreignKey: 'reportado_id',
    as: 'reportado'
  });

  Report.hasMany(models.Penalizacao, {
    foreignKey: 'report_id',
    as: 'penalizacoes'
  });
};

module.exports = Report;
