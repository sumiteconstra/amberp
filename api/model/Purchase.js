const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const Vendor = require("./Vendor");
const Product = require("./Product");
//const Payment = require("./RegisterPayment");





const Purchase = sequelize.define(
    'Purchase',
    {
        
        reference_number: {
            type: DataTypes.STRING,
            allowNull: true,
           
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        vendor_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order_dateline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expected_arrival: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        buyer: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        source_document: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_terms: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            
        },total_amount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        untaxed_amount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        company_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }, is_parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_parent: {
            type: DataTypes.INTEGER,
            allowNull: true,
            
        },
        parent_recd_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        mailsend_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'purchase',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);

const PurchaseProduct = sequelize.define(
    'PurchaseProduct',
    {
        purchase_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
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
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        tax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        taxExcl: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, 
        taxIncl: {
            type: DataTypes.DECIMAL,
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
       
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        }


    },
    {
        tableName: 'purchase_product',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);



const Remarks = sequelize.define(
    'Remarks',
    {
        purchase_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
           
        }

    },
    {
        tableName: 'remarks',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);
const Followup = sequelize.define(
    'Followup',
    {
        purchase_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
           
        }

    },
    {
        tableName: 'followup',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);
const AdvancePayment = sequelize.define(
    'AdvancePayment',
    {
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            unique: false
        },

        purchase_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
           
        },company_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }

    },
    {
        tableName: 'advance_payment',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);

Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchase_id' });
Purchase.hasMany(PurchaseProduct, { foreignKey: 'purchase_id' ,as:"products"});
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'purchase_id' });
Purchase.belongsTo(Vendor, { foreignKey: 'vendor_id',as: 'vendor' });
PurchaseProduct.belongsTo(Product, { foreignKey: 'product_id' ,as:"ProductsItem"});
Purchase.hasOne(Remarks, { foreignKey: 'purchase_id',as: 'remarkdata' });
Remarks.belongsTo(Purchase, { foreignKey: 'purchase_id',as: 'remark' });
Purchase.hasMany(Followup, { foreignKey: 'purchase_id',as: 'followup' });
Purchase.hasOne(AdvancePayment, { foreignKey: 'purchase_id',as: 'advance' });

// AdvancePayment.belongsTo(Payment, {
//     foreignKey: 'purchase_id',
//     as: 'bal',
//   });

module.exports = { Purchase, PurchaseProduct, Remarks, AdvancePayment,Followup,  sequelize };


//