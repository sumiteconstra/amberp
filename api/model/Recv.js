const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const RecvProduct = require("./RecvProduct");
const Product = require("./Product");
const Vendor = require("./Vendor");
const Payment = require("./RegisterPayment");

const Recv = sequelize.define(
  "Recv",
  {
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bill_number:{
        type: DataTypes.STRING,
        allowNull: true,
      },
    purchase_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bill_reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accounting_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bill_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    placeofsupply: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    buyer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentreference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    untaxed_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sgst: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    cgst: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    advancePayment: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }, 
     status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "recv",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Recv.hasMany(RecvProduct, { foreignKey: "bill_id", as: "recvPro" });
RecvProduct.belongsTo(Product, { foreignKey: 'product_id' ,as:"ProductsItem"});
Recv.hasOne(Payment, { foreignKey: "bill_id", as: "allBill" });
Recv.belongsTo(Vendor, { foreignKey: 'vendor_id',as: 'vendorname' });

module.exports = Recv;
