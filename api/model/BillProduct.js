const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const Vendor = require("./Vendor");
const Bill = require("./Bill");

const BillProduct = sequelize.define(
  "BillProduct",
  {
   
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    taxExcl: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    taxIncl: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    received: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "billproduct",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

//BillProduct.belongsTo(Bill, { foreignKey: "bill_id", as: "bill" });

module.exports = BillProduct;