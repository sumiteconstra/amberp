const { DataTypes } = require("sequelize");
const Joi = require("joi");
const sequelize = require("../db/db");
const ProductCategories = require("./ProductCategory");
const MasteruomModel = require("./MasteruomModel");
const TrackProductStock = require("./TrackProductStock");
const FinishedGoods = require("./FinishedGoods");
const CompanyManagementModel = require("./CompanyManagement");
const Product = sequelize.define(
    'product',
    {
        product_name: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
       
        product_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sku_product:{
            type:DataTypes.STRING,
            allowNull:true,
        },
         batch_number:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        product_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_category: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        regular_buying_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        wholesale_buying_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        regular_selling_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        mrp: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        dealer_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        distributor_price: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        hsn_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        total_stock: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        reject_stock: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minimum_stock_level: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        maximum_stock_level: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        attachment_file: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM,
           values: [1,0],
        },
        
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        company_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status:{
            type: DataTypes.INTEGER,
        },
        // New fields
        safety_stock: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sku_description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        replenishment_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        replenishment_multiplications: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minimum_replenishment: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        buffer_size: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        store_id :{
            type: DataTypes.INTEGER,
            allowNull: true,
        }
        
    },
    {
        tableName: 'product',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);

// Product.validate = (data) => {
//     const schema = Joi.object({
//         product_name: Joi.string().required(),
//         product_type: Joi.string().required(),
//         unit: Joi.string().required(),
//         product_price: Joi.string().required(),
//     });
//     return schema.validateAsync(data, { abortEarly: false, errors: { label: 'key', wrap: { label: false } } })
// }
// ✅ Define Relationship: Product → FinishedGoods
Product.hasOne(FinishedGoods, {
    foreignKey: "product_id",
    as: "FinishedGoodsItem",
});
FinishedGoods.belongsTo(Product, {
    foreignKey: "product_id",
    as: "ProductsItem",
});
Product.belongsTo(ProductCategories, {
    constraints: false,
    foreignKey: 'product_category',
    as: 'Categories'
});
Product.belongsTo(MasteruomModel, {
    constraints: false,
    foreignKey: 'unit',
    as: 'Masteruom'
});

 
Product.hasMany(TrackProductStock, {
    foreignKey: 'product_id',
    as: 'TrackProductStock',
});

module.exports = Product;
