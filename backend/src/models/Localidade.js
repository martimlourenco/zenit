const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Localidade = sequelize.define('Localidade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'localidades',
  timestamps: false
});

Localidade.associate = models => {
  Localidade.hasMany(models.User, { foreignKey: 'localidade', as: 'users' });
  Localidade.hasMany(models.Evento, { foreignKey: 'localidade', as: 'eventos' });
};

module.exports = Localidade;
