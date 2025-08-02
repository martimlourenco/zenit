const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leaderboard = sequelize.define('Leaderboard', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  temporada_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  modalidade_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  localidade_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pontos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  tipo: {
    type: DataTypes.ENUM('global', 'semanal', 'por_modalidade', 'por_localidade'),
    allowNull: false
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  data_calculo: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'leaderboards',
  timestamps: false
});

Leaderboard.associate = models => {
  Leaderboard.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Leaderboard.belongsTo(models.Temporada, { foreignKey: 'temporada_id', as: 'temporada' });
  Leaderboard.belongsTo(models.Modalidade, { foreignKey: 'modalidade_id', as: 'modalidade' });
  Leaderboard.belongsTo(models.Localidade, { foreignKey: 'localidade_id', as: 'localidade' });
};

module.exports = Leaderboard;
