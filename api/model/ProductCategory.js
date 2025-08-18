const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sequelize = require("../db/db");
const Joi = require("joi");


const ProductCategories = sequelize.define(
    'categories',
    {
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
       
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        tableName: 'categories',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: 'updated_at',
    },
);
// module.exports = ProductCategories;

// ProductCategories.validate = (data) => {
//     const schema = Joi.object({

//         title: Joi.string().required(),
       
//     });
//     return schema.validateAsync(data, { abortEarly: false, errors: { label: 'key', wrap: { label: false } } })
// }

ProductCategories.validate = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .pattern(/^[a-zA-Z0-9 ]*$/)  // Allow only alphanumeric characters and spaces
            .required()
            .messages({
                'string.pattern.base': 'Title can only contain alphanumeric characters and spaces.',
                'string.empty': 'Title is required.'
            }),
    });

    return schema.validateAsync(data, {
        abortEarly: false,
        errors: {
            label: 'key',
            wrap: { label: false }
        }
    });
};

module.exports = ProductCategories;
