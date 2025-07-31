const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Desafio = sequelize.define('Desafio', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pontos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'desafios',
  timestamps: false
});

Desafio.associate = models => {
  Desafio.hasMany(models.UserDesafio, { foreignKey: 'desafio_id', as: 'user_desafios' });
};

module.exports = Desafio;
