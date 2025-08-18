const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");
const Bank = require("./CustomerBank");
const Customerbank = require("./CustomerBank");



const Customer = sequelize.define(
    'Customer',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
       
        type: {
            type: DataTypes.STRING,
            allowNull: true,
           
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
         tags: {
                    type: DataTypes.STRING,
                   allowNull: true,
                },
                ratings: {
                    type: DataTypes.NUMBER,
                   allowNull: true,
                },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zip: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sales_person: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gstin: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pan: {
            type: DataTypes.STRING,
            allowNull: true,
        },


        attachment_file: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            
        },
        website: {
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
    },
    {
        tableName: 'customer',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);

// Vendor.validate = (data) => {
//     const schema = Joi.object({
//         vendor_name: Joi.string().required(),
//         type: Joi.string().required(),
//         address: Joi.string().required(),
//         sales_person: Joi.string().required(),
//         gstin: Joi.string().required(),
//         pan: Joi.string().required(),
//         mobile: Joi.string().required(),
//         email: Joi.string().required(),
//         website: Joi.string().required()
       
//     });
//     return schema.validateAsync(data, {
//         abortEarly: false,
//         errors: {
//             label: 'key',
//             wrap: { label: false }
//         }
//     });
// }


Customer.hasOne(Customerbank, {
    constraints: false,
    foreignKey: 'customer_id',
    as: 'bank'
});

module.exports = Customer;

