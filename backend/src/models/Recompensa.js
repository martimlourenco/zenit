const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recompensa = sequelize.define('Recompensa', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  custo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'recompensas',
  timestamps: false
});

Recompensa.associate = models => {
  Recompensa.hasMany(models.HistoricoRecompensa, { foreignKey: 'recompensa_id', as: 'historico_recompensas' });
};

module.exports = Recompensa;
