const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BadgesCatalogo = require('./BadgesCatalogo');
const User = require('./User');

const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  badge_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: BadgesCatalogo,
      key: 'id'
    }
  },
  data_atribuicao: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'user_badges',
  timestamps: false
});

// Relações
UserBadge.associate = models => {
  UserBadge.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  UserBadge.belongsTo(models.BadgesCatalogo, { foreignKey: 'badge_id', as: 'badge' });
};

module.exports = UserBadge;
