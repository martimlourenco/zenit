const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modalidade = sequelize.define('Modalidade', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icone_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'modalidades',
  timestamps: false
});

// Relações
Modalidade.associate = models => {
  Modalidade.hasMany(models.User, {
    foreignKey: 'desporto_favorito',
    as: 'utilizadores'
  });

  Modalidade.hasMany(models.Evento, {
    foreignKey: 'modalidade',
    as: 'eventos'
  });
};

module.exports = Modalidade;
