const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const RoleHasPermissionModel = sequelize.define(
    'RoleHasPermission',
    {
        permission_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        role_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    },
    {
        tableName: 'role_has_permissions',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',

    },
);


module.exports = RoleHasPermissionModel;

