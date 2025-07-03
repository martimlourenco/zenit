const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: DataTypes.STRING,
    username: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    birthdate: DataTypes.DATE,
    location: DataTypes.STRING,
    country: DataTypes.STRING
});

module.exports = User;
