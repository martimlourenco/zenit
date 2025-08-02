const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Temporada = sequelize.define('Temporada', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'temporadas',
  timestamps: false
});

Temporada.associate = models => {
  // Relação com pontuações da temporada se necessário
};

module.exports = Temporada;
