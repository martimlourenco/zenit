const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Genre = sequelize.define('Genre', {
    tmdb_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Genre;
