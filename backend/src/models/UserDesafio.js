const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDesafio = sequelize.define('UserDesafio', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  desafio_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  semana_ref: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  concluido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'user_desafios',
  timestamps: false
});

UserDesafio.associate = models => {
  UserDesafio.belongsTo(models.User, { 
    foreignKey: 'user_id', 
    as: 'user',
    onDelete: 'CASCADE'
  });
  UserDesafio.belongsTo(models.Desafio, { 
    foreignKey: 'desafio_id', 
    as: 'desafio',
    onDelete: 'CASCADE'
  });
};

module.exports = UserDesafio;
