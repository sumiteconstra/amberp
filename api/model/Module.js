const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Permission = require("./Permission");

const Module = sequelize.define("Module", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "modules",
  timestamps: false,
});

Module.hasMany(Permission, {
  constraints: false,
  foreignKey: 'module',
  as: "allmodule",
})

module.exports = Module;


