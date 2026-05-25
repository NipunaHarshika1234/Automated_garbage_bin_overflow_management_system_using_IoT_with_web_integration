const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    areas: {
        type: DataTypes.JSON, // Stores array as JSON string
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
    },
    notices: {
        type: DataTypes.JSON, // Stores array as JSON string
        defaultValue: []
    }
});

module.exports = Collection;
