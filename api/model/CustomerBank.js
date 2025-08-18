const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");



const Customerbank = sequelize.define(
    'Customerbank',
    {
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: false
        },
       
        account_number: {
            type: DataTypes.STRING,
            allowNull: true,
           
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        account_holder: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ifsc_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        primary_account: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    },
    {
        tableName: 'customer_bank_details',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);




// Vendor.belongsTo(VendorCategories, {
//     constraints: false,
//     foreignKey: 'Vendor_category',
//     as: 'Categories'
// });

module.exports = Customerbank;

