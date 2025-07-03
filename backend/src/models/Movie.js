const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Genre = require('./Genre');

const Movie = sequelize.define('Movie', {
    tmdb_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    overview: { type: DataTypes.TEXT },
    release_date: { type: DataTypes.DATE },
    poster_path: { type: DataTypes.STRING },
    backdrop_path: { type: DataTypes.STRING },
    vote_average: { type: DataTypes.FLOAT }
});

// 🔥 Tabela intermediária MovieGenres (Muitos para Muitos)
Movie.belongsToMany(Genre, { through: 'MovieGenres' });
Genre.belongsToMany(Movie, { through: 'MovieGenres' });

module.exports = Movie;
