const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const BillProduct = require("./BillProduct");
const Product = require("./Product");
const Vendor = require("./Vendor");
const Payment = require("./RegisterPayment");
const { Purchase } = require("./Purchase");

const Bill = sequelize.define(
  "Bill",
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
    tableName: "bill",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Bill.hasMany(BillProduct, { foreignKey: "bill_id", as: "products" });
BillProduct.belongsTo(Product, { foreignKey: 'product_id' ,as:"ProductsItem"});
Bill.hasOne(Payment, { foreignKey: "bill_id", as: "allBill" });
Bill.belongsTo(Vendor, { foreignKey: 'vendor_id',as: 'vendorname' });
Bill.belongsTo(Purchase, { foreignKey: "purchase_id", as: "purchase" });
Purchase.hasOne(Bill, { foreignKey: "purchase_id", as: "bill" }); // <-- Required
module.exports = Bill;
