const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');

const Recommendation = sequelize.define('Recommendation', {
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    receiver_id: {
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
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    // Caso queira customizar o nome da tabela ou outras opções, adicione aqui
    tableName: 'Recommendations'
});

// Definindo as associações
Recommendation.belongsTo(User, { foreignKey: 'sender_id', as: 'sender', onDelete: 'CASCADE' });
Recommendation.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver', onDelete: 'CASCADE' });
Recommendation.belongsTo(Movie, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

User.hasMany(Recommendation, { foreignKey: 'sender_id', as: 'sentRecommendations', onDelete: 'CASCADE' });
User.hasMany(Recommendation, { foreignKey: 'receiver_id', as: 'receivedRecommendations', onDelete: 'CASCADE' });
Movie.hasMany(Recommendation, { foreignKey: 'movie_id', onDelete: 'CASCADE' });

module.exports = Recommendation;
