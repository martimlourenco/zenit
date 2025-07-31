const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoricoRecompensa = sequelize.define('HistoricoRecompensa', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  recompensa_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  data_utilizacao: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'historico_recompensas',
  timestamps: false
});

HistoricoRecompensa.associate = models => {
  HistoricoRecompensa.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  HistoricoRecompensa.belongsTo(models.Recompensa, { foreignKey: 'recompensa_id', as: 'recompensa' });
};

module.exports = HistoricoRecompensa;
