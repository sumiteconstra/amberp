const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const Customer = require("./Customer");
const Product = require("./Product");
const User = require("./User");
const CompanyManagementModel = require("./CompanyManagement");
//const Payment = require("./RegisterPayment");





const Purchase = sequelize.define(
    'Purchase',
    {
        
        reference_number: {
            type: DataTypes.STRING,
            allowNull: true,
           
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        customer_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        expiration: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dalivery_date: {
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
        uploadpo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'sale',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);

const PurchaseProduct = sequelize.define(
    'PurchaseProduct',
    {
        sales_id: {
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
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, 
        taxIncl: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },taxAmount: {
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
        },
        production_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        production_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_dispatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        
        is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        is_invoice: { type: DataTypes.BOOLEAN, defaultValue: false },
        invoice_number: { type: DataTypes.STRING, allowNull: true },
        invoice_date: { type: DataTypes.DATE, allowNull: true },
        invoice_created_by: { type: DataTypes.INTEGER, allowNull: true },

    },
    {
        tableName: 'sales_product',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);

const PurchaseRe = sequelize.define(
    'PurchaseRe',
    {
        sales_id:{
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        customer_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        expiration: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dalivery_date: {
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
        }
        
      
    },
    {
        tableName: 'sale_rev',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);

const PurchaseProductRe = sequelize.define(
    'PurchaseProductRe',
    {
        sales_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
        sales_re_id: {
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
        customer_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }, 
        taxIncl: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        taxAmount: {
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
  


    },
    {
        tableName: 'sales_product_rev',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);


const Remarks = sequelize.define(
    'Remarks',
    {
        sales_id: {
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
        tableName: 'sales_remarks',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);
const Followup = sequelize.define(
    'Followup',
    {
        sales_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false
        },
       
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
           
        },
        next_followup_date: {
            type: DataTypes.DATE,
            allowNull: true,
           
        },

    },
    {
        tableName: 'sales_followup',
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

        sales_id: {
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
        tableName: 'sales_advance_payment',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    }
);

Purchase.hasMany(PurchaseProduct, { foreignKey: 'sales_id' });
Purchase.hasMany(PurchaseProduct, { foreignKey: 'sales_id' ,as:"products"});
PurchaseProduct.belongsTo(Purchase, { foreignKey: 'sales_id' });
Purchase.belongsTo(Customer, { foreignKey: 'customer_id',as: 'customer' });
PurchaseProduct.belongsTo(Product, { foreignKey: 'product_id' ,as:"ProductsItem"});
Purchase.hasOne(Remarks, { foreignKey: 'sales_id',as: 'remarkdata' });
Remarks.belongsTo(Purchase, { foreignKey: 'sales_id',as: 'remark' });
Purchase.hasMany(Followup, { foreignKey: 'sales_id',as: 'followup' });
Purchase.hasOne(AdvancePayment, { foreignKey: 'sales_id',as: 'advance' });
PurchaseRe.hasMany(PurchaseProductRe, { foreignKey: 'sales_re_id' ,as:"productsre"});
//Purchase.hasMany(PurchaseProductRe, { foreignKey: 'sales_re_id',as:"productsreprodutlist"  });
Purchase.hasMany(PurchaseRe, { foreignKey: 'sales_id',as:"productsreprodut" });
PurchaseProductRe.belongsTo(Product, { foreignKey: 'product_id' ,as:"ProductsItemre"});
Purchase.belongsTo(User, { foreignKey: "user_id", as: "createdByUser" });

// AdvancePayment.belongsTo(Payment, {
//     foreignKey: 'sales_id',
//     as: 'bal',
//   });
PurchaseProduct.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

PurchaseProduct.belongsTo(Purchase, { foreignKey: 'sales_id', as: "purchase" });
Purchase.belongsTo(CompanyManagementModel, {
    foreignKey: 'company_id',
    as: 'companyManagement'
});
module.exports = { Purchase, PurchaseProduct, Remarks, AdvancePayment,Followup, PurchaseRe, PurchaseProductRe, sequelize };


//