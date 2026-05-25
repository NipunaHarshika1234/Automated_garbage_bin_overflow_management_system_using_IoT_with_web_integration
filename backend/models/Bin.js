const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bin = sequelize.define('Bin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    binId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING
    },
    fillLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'overflowing', 'offline'),
        defaultValue: 'active'
    }
}, {
    hooks: {
        beforeSave: (bin) => {
            if (bin.fillLevel >= 90) {
                bin.status = 'overflowing';
            } else if (bin.status === 'overflowing' && bin.fillLevel < 90) {
                bin.status = 'active';
            }
        }
    }
});

module.exports = Bin;
