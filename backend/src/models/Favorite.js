const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');

const Favorite = sequelize.define('Favorite', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Movie,
            key: 'id'
        }
    }
});

// 🔥 Definir as associações corretamente
Favorite.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Favorite.belongsTo(Movie, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

User.hasMany(Favorite, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Movie.hasMany(Favorite, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

module.exports = Favorite;
