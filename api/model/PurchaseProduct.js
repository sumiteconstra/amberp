const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");



const PurchaseProduct = sequelize.define(
    'PurchaseProduct',
    {
        purchase_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
        product_id: {
            type: DataTypes.STRING,
            allowNull: true,
           
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        unit_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        tax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        taxExcl: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, byer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tax_amount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        discountAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }


    },
    {
        tableName: 'purchase_product',
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

module.exports = PurchaseProduct;

