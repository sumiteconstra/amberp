const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");


const Permission = sequelize.define("Permission", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guard_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "web",
  },
  module: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: "permissions_data",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: 'updated_at',
});


module.exports = Permission;
