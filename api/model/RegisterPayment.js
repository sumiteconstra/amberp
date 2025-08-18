const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const BillProduct = require("./BillProduct");
const Product = require("./Product");
const Vendor = require("./Vendor");
const { AdvancePayment } = require("./Purchase");


const Payment = sequelize.define('Payment', {
    journal: {
        type: DataTypes.STRING,
        allowNull: true
    },
    purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bill_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    recipientBankAccount: {
        type: DataTypes.STRING,
        allowNull: true
    },
    memo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

AdvancePayment.belongsTo(Payment, {
    foreignKey: 'purchase_id',
    as: 'bal',
  });

  

module.exports = Payment;
