const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const Permission = require("./Permission");
const RoleHasPermissionModel = require("./RoleHasPermissionsModel");

const Role = sequelize.define("Role", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_delete: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "role",
  timestamps: false,
});

Role.belongsToMany(Permission, {
  through: RoleHasPermissionModel,
  constraints: false,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: "permissions"
});


module.exports = Role;