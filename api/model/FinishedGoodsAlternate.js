const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const BOM = require("./Bom");

const FinishedGoodsAlternate = sequelize.define("FinishedGoodsAlternate", {
  bomId: { type: DataTypes.INTEGER, references: { model: BOM, key: "id" } },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  product_code: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  unit: { type: DataTypes.STRING },
  costAllocation: { type: DataTypes.FLOAT },
  comment: { type: DataTypes.TEXT },
  company_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "finishedgoods_alternate",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// Relationships
BOM.hasMany(FinishedGoodsAlternate, { foreignKey: "bomId", as: "finishedGoodsAlternate" });
FinishedGoodsAlternate.belongsTo(BOM, { foreignKey: "bomId", as: "bom" });

module.exports = FinishedGoodsAlternate;
