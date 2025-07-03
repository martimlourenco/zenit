const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');

const LikeDislike = sequelize.define('LikeDislike', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Movie, key: 'id' }
    },
    type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false
    }
});

// 🔥 Definir as associações corretamente
LikeDislike.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
LikeDislike.belongsTo(Movie, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

User.hasMany(LikeDislike, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Movie.hasMany(LikeDislike, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

module.exports = LikeDislike;
