const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const CompanyModel = sequelize.define(
  "Company",
  {
    project_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    p_isd: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    company_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    which_whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    greenapi_instance_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    greenapi_apitoken_instance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_phone_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_api_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gst_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "extra_tbl",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const GeneralSettings = sequelize.define(
  "GeneralSettings",
  {
    company_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Ensure this or an appropriate unique constraint
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    which_whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    greenapi_instance_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    greenapi_apitoken_instance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_product_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_phone_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maytapi_api_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta_phone_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gupshup_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gupshup_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "general_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_id"],
      },
    ],
  }
);

module.exports = { CompanyModel, GeneralSettings };
