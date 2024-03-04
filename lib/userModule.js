// models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('./sDB');

const User = sequelize.define('users', {
  phone: {
    type: DataTypes.NUMBER,
    // allowNull: false,
  },
}, 
{
    primaryKey: false, // Disable timestamps
    timestamps: false,
  });

module.exports = User;
