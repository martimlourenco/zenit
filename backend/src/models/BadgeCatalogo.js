const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BadgesCatalogo = sequelize.define('BadgesCatalogo', {
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
  tipo: {
    type: DataTypes.ENUM('positiva', 'negativa'),
    allowNull: false
  },
  foto_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'badges_catalogo',
  timestamps: false
});

// Relações
BadgesCatalogo.associate = models => {
  BadgesCatalogo.hasMany(models.UserBadge, {
    foreignKey: 'badge_id',
    as: 'user_badges'
  });
};

module.exports = BadgesCatalogo;
