const { Op, fn, col, literal } = require("sequelize");
const Product = require("../model/Product");
const axios = require("axios");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const User = require("../model/User");
const { CompressImage } = require("../utils/ImageUpload");
const ProductCategories = require("../model/ProductCategory");
const MasteruomModel = require("../model/MasteruomModel");
const WarehouseModel = require("../model/WarehouseModel");
const CompanyManagement = require("../model/CompanyManagement");


const XLSX = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { uploadDir } = require("../utils/handlersbluk");
const { error } = require("console");
const TrackProductStock = require("../model/TrackProductStock");
const generateUniqueReferenceNumber = require("../utils/generateReferenceNumber");
const sequelize = require("../db/db");
const moment = require('moment');

const CompanyManagementModel = require("../model/CompanyManagement");
const { GupShupMessage } = require("../utils/GupShupMessage");
const { GeneralSettings } = require("../model/CompanyModel");
async function findCategoryByName(categoryName, companyId) {
  const category = await ProductCategories.findOne({ where: { title: categoryName, company_id: companyId } });
  return category ? category.id : null;
}

async function findUnitByName(unitName, companyId) {
  const unit = await MasteruomModel.findOne({ where: { unit_name: unitName, company_id: companyId } });
  return unit ? unit.id : await insertUOM(unitName, companyId);
}

async function insertCategory(categoryName, userId, companyId) {
  const category = await ProductCategories.create({ title: categoryName, user_id: userId, company_id: companyId });
  return category.id;
}

async function insertUOM(unitName, companyId) {
  const unit = await MasteruomModel.create({ unit_name: unitName, bill_uom: unitName, company_id: companyId });
  return unit.id;
}

async function insertProduct(product, userId, companyId, options = {}) {
  try {
    return await Product.create({ ...product, user_id: userId, company_id: companyId }, options);
  } catch (error) {
    console.error("Error in insertProduct:", error.message, "Product Data:", product);
    throw error; // Ensure the error message is propagated
  }
}


// exports.uploadProducts = async (req, res) => {
//   try {
//     // Check if a file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ status: false, message: 'No file uploaded' });
//     }

//     const file = req.file;
//     const filePath = path.join(__dirname, '../uploads', file.filename);

//     // Validate file extension
//     const fileExtension = path.extname(file.originalname).toLowerCase();
//     if (fileExtension !== '.xlsx') {
//       fs.unlinkSync(filePath); // Clean up invalid file
//       return res.status(400).json({ status: false, message: 'File format should be .xlsx' });
//     }

//     // Validate file size (max 10 MB)
//     const fileSize = file.size;
//     if (fileSize > 10 * 1024 * 1024) {
//       fs.unlinkSync(filePath); // Clean up large file
//       return res.status(400).json({ status: false, message: 'File size exceeds 10 MB' });
//     }

//     const workbook = XLSX.readFile(filePath);

//     // Check for merged cells
//     for (const sheetName of workbook.SheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       if (sheet['!merges'] && sheet['!merges'].length > 0) {
//         fs.unlinkSync(filePath);
//         return res.status(400).json({ status: false, message: 'Merged cells are not allowed' });
//       }
//     }

//     // Process the first sheet
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     // Validate row count
//     if (data.length > 500) {
//       fs.unlinkSync(filePath); // Clean up excessive data file
//       return res.status(400).json({ status: false, message: 'Maximum number of rows allowed is 500' });
//     }

//     // Fetch the default warehouse
//     const store = await WarehouseModel.findOne({
//       where: {
//         company_id: req.user.company_id,
//         store_type: "In-Stock Stores",
//         is_default: 1,
//       },
//     });

//     if (!store) {
//       fs.unlinkSync(filePath); // Clean up file
//       return res.status(400).json({ status: false, message: "Default warehouse not found" });
//     }

//     const products = [];
//     for (const row of data) {
//       const productName = row['Item Name'];
//       const ptype = row['Item Type (Buy/Sell/Both)'];
//       const unitName = row['Unit of Measurement'];

//       if (!productName || !ptype || !unitName) {
//         throw new Error(`Missing required fields. Item Name: ${productName}, Item Type: ${ptype}, Unit of Measurement: ${unitName}`);
//       }

//       const hsn_code = row['HSN Code'] || null;
//       const product_type = row['Product/Service'] || null;
//       const productPrice = row['Default Price'] || null;
//       const productCategoryName = row['Item Category'] || null;
//       const regularBuyingPrice = row['Regular Buying Price'] || null;
//       const wholesaleBuyingPrice = row['Wholesale Buying Price'] || null;
//       const regularSellingPrice = row['Regular Selling Price'] || null;
//       const mrp = row['MRP'] || null;
//       const dealerPrice = row['Dealer Price'] || null;
//       const distributorPrice = row['Distributor Price'] || null;
//       const totalStock = row['Current Stock'] || 0;
//       const minimumStockLevel = row['Min Stock Level'] || 0;
//       const maximumStockLevel = row['Max Stock Level'] || 0;
//       const taxprice = row['Tax'] || '18';

//       let categoryId = null;
//       if (productCategoryName) {
//         categoryId = await findCategoryByName(productCategoryName, req.user.company_id);
//         if (!categoryId) {
//           categoryId = await insertCategory(productCategoryName, req.user.id, req.user.company_id);
//         }
//       }

//       const unitId = await findUnitByName(unitName, req.user.company_id);
//       if (!unitId) {
//         throw new Error(`Unit of Measurement "${unitName}" not found.`);
//       }

//       const product = {
//         product_name: productName,
//         product_type: product_type,
//         type: ptype,
//         unit: unitId,
//         product_code: 'SKU' + Math.floor(10000000 + Math.random() * 90000000).toString(),
//         hsn_code: hsn_code,
//         product_price: productPrice,
//         product_category: categoryId,
//         regular_buying_price: regularBuyingPrice,
//         wholesale_buying_price: wholesaleBuyingPrice,
//         regular_selling_price: regularSellingPrice,
//         mrp,
//         dealer_price: dealerPrice,
//         tax: taxprice,
//         distributor_price: distributorPrice,
//         total_stock: totalStock,
//         minimum_stock_level: minimumStockLevel,
//         maximum_stock_level: maximumStockLevel,
//         store_id: store.id,
//       };

//       const savedProduct = await insertProduct(product, req.user.id, req.user.company_id);

//       if (!savedProduct || !savedProduct.id) {
//         console.error("Insert Product Failed. Product Data:", product);
//         throw new Error("Failed to insert product or retrieve product ID.");
//       }

//       console.log("Product Inserted Successfully:", savedProduct);

//       try {
//         const referenceNumber = await generateUniqueReferenceNumber();
//         await TrackProductStock.create({
//           product_id: savedProduct.id,
//           item_name: product.product_name,
//           store_id: store.id,
//           reference_number: "INV" + referenceNumber,
//           barcode_number: generateRandomBarcode(),
//           quantity_changed: product.total_stock || 0,
//           final_quantity: product.total_stock || 0,
//           default_price: product.product_price || 0,
//           item_unit: product.unit,
//           adjustmentType: "Other",
//           status_in_out: 1,
//         });
//         console.log("TrackProductStock Inserted for Product ID:", savedProduct.id);
//       } catch (trackStockError) {
//         console.error("Error inserting into TrackProductStock:", trackStockError.message);
//         throw new Error("Failed to insert product stock tracking information.");
//       }
//     }


//     // Clean up and respond
//     fs.unlinkSync(filePath);
//     res.status(200).json({ status: true, message: 'Products uploaded successfully', data: products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
//   }
// };

exports.uploadProducts = async (req, res) => {
  const filePath = req.file
    ? path.join(__dirname, '../uploads', req.file.filename)
    : null;

  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'No file uploaded' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.xlsx') {
      fs.unlinkSync(filePath); // Remove invalid file
      return res.status(400).json({ status: false, message: 'File format should be .xlsx' });
    }

    if (req.file.size > 10 * 1024 * 1024) { // Max 10 MB
      fs.unlinkSync(filePath); // Remove oversized file
      return res.status(400).json({ status: false, message: 'File size exceeds 10 MB' });
    }

    const workbook = XLSX.readFile(filePath);

    // Validate merged cells
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (sheet['!merges'] && sheet['!merges'].length > 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ status: false, message: 'Merged cells are not allowed' });
      }
    }

    // Parse the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length > 500) {
      fs.unlinkSync(filePath); // Cleanup file
      return res.status(400).json({ status: false, message: 'Maximum number of rows allowed is 500' });
    }

    // Fetch the default warehouse
    const store = await WarehouseModel.findOne({
      where: { company_id: req.user.company_id, store_type: 'In-Stock Stores', is_default: 1 },
    });

    if (!store) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ status: false, message: 'Default warehouse not found' });
    }

    const transaction = await sequelize.transaction(); // Begin transaction
    try {
      const products = [];

      for (const row of data) {
        // Extract and validate row data
        const {
          'Item Name': productName,
          'Item Type (Buy/Sell/Both)': ptype,
          'Unit of Measurement': unitName,
          'HSN Code': hsnCode = null,
          'SKU': skuProduct = null,
          'Batch Number': batchNumber = null,
          'Product/Service': productType = null,
          'Default Price': productPrice = null,
          'Item Category': productCategoryName = null,
          'Regular Buying Price': regularBuyingPrice = null,
          'Wholesale Buying Price': wholesaleBuyingPrice = null,
          'Regular Selling Price': regularSellingPrice = null,
          MRP: mrp = null,
          'Dealer Price': dealerPrice = null,
          'Distributor Price': distributorPrice = null,
          'Current Stock': totalStock = 0,
          'Min Stock Level': minimumStockLevel = 0,
          'Max Stock Level': maximumStockLevel = 0,
          Tax: taxPrice = '18',
        } = row;

        if (!productName || !ptype || !unitName) {
          throw new Error(`Missing required fields: ${JSON.stringify(row)}`);
        }

        // Handle category
        let categoryId = null;
        if (productCategoryName) {
          categoryId = await findCategoryByName(productCategoryName, req.user.company_id);
          if (!categoryId) {
            categoryId = await insertCategory(productCategoryName, req.user.id, req.user.company_id);
          }
        }

        // Handle unit
        const unitId = await findUnitByName(unitName, req.user.company_id);
        if (!unitId) {
          throw new Error(`Unit "${unitName}" not found.`);
        }

        // Prepare product data
        const product = {
          product_name: productName,
          product_type: productType,
          type: ptype,
          unit: unitId,
          product_code: `${Math.floor(10000000 + Math.random() * 90000000)}`,
          hsn_code: hsnCode,
          sku_product: skuProduct,
          batch_number: batchNumber,
          product_price: parseFloat(productPrice) || 0,
          product_category: categoryId,
          regular_buying_price: parseFloat(regularBuyingPrice) || 0,
          wholesale_buying_price: parseFloat(wholesaleBuyingPrice) || 0,
          regular_selling_price: parseFloat(regularSellingPrice) || 0,
          mrp: parseFloat(mrp) || 0,
          dealer_price: parseFloat(dealerPrice) || 0,
          tax: parseFloat(taxPrice) || 0,
          distributor_price: parseFloat(distributorPrice) || 0,
          total_stock: parseInt(totalStock) || 0,
          minimum_stock_level: parseInt(minimumStockLevel) || 0,
          maximum_stock_level: parseInt(maximumStockLevel) || 0,
          store_id: store.id,
        };

        console.log("Attempting to insert product:", product);

        const savedProduct = await insertProduct(product, req.user.id, req.user.company_id, { transaction });
        if (!savedProduct || !savedProduct.id) {
          throw new Error(`Failed to insert product: ${JSON.stringify(product)}`);
        }

        // Add stock tracking
        const referenceNumber = await generateUniqueReferenceNumber();
        await TrackProductStock.create({
          product_id: savedProduct.id,
          item_name: product.product_name,
          store_id: store.id,
          reference_number: `INV${referenceNumber}`,
          barcode_number: generateRandomBarcode(),
          quantity_changed: product.total_stock || 0,
          final_quantity: product.total_stock || 0,
          default_price: product.product_price || 0,
          item_unit: product.unit,
          adjustmentType: 'Other',
          status_in_out: 1,
          user_id: req.user.id,
          company_id: req.user.company_id
        }, { transaction });

        products.push(savedProduct);
      }

      await transaction.commit(); // Commit transaction
      fs.unlinkSync(filePath); // Cleanup file
      return res.status(200).json({ status: true, message: 'Products uploaded successfully', data: products });

    } catch (transactionError) {
      await transaction.rollback(); // Rollback transaction
      console.error('Transaction error:', transactionError.message);
      throw transactionError;
    }
  } catch (error) {
    console.error('Upload error:', error.message);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Ensure file is cleaned up on error

    }
    res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
  }
};

const generateRandomBarcode = () => {
  const barcodeLength = 16;
  let barcode = "";

  for (let i = 0; i < barcodeLength; i++) {
    barcode += Math.floor(Math.random() * 10); // Generate a digit from 0 to 9
  }

  return barcode;
};

// Function to save categories to the database
const saveCategories = async (categories, userId, companyId) => {
  for (const category of categories) {
    await Product.create({
      product_name: category.product_name,
      product_type: category.product_type,
      unit: category.unit,
      product_code: category.product_code,
      product_price: category.product_price,
      product_category: category.product_category,
      user_id: userId,
      company_id: companyId,
    });
  }
};

exports.AddProduct = async (req, res) => {
  try {
    // Fetch the default warehouse (In-Stock Store) for the company
    const store = await WarehouseModel.findOne({
      where: {
        company_id: req.user.company_id,
        store_type: "In-Stock Stores",
        is_default: 1,
      },
    });

    if (!store) {
      return res
        .status(400)
        .json({ status: false, message: "Default warehouse not found" });
    }

    // Create the product with the warehouse's store_id
    const ProductData = await Product.create({
      product_code: req.body.product_code,
      product_name: req.body.product_name,
      product_type: req.body.product_type,
      type: req.body.type,
      sku_product: req.body.sku_product,
      batch_number: req.body.batch_number,
      unit: req.body.unit,
      product_price: req.body.product_price,
      product_category: req.body.product_category,
      total_stock: req.body.total_stock,
      hsn_code: req.body.hsn_code,
      tax: req.body.tax,
      minimum_stock_level: req.body.minimum_stock_level,
      maximum_stock_level: req.body.maximum_stock_level,
      user_id: req.user.id,
      company_id: req.user.company_id,
      store_id: store.id, // Using the warehouse's store_id
    });
    const referenceNumber = await generateUniqueReferenceNumber();
    // Use the ProductData.id to insert in TrackProductStock
    await TrackProductStock.create({
      product_id: ProductData.id, // Inserted product's id
      item_name: req.body.product_name,
      store_id: store.id,
      reference_number: "INV" + referenceNumber,
      barcode_number: generateRandomBarcode(),
      quantity_changed: req.body.total_stock,
      final_quantity: req.body.total_stock,
      default_price: req.body.product_price,
      item_unit: req.body.unit,
      adjustmentType: "Other",
      user_id: req.user.id,
      company_id: req.user.company_id,
      status_in_out: 1,
    });
    //console.log(v);

    return res
      .status(200)
      .json({ status: true, message: "success", data: ProductData });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.UpdateProduct = async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const sectionData = req.body;
//     const updateFields = {};

//     // Process uploaded file before updating the product details
//     if (req.file) {
//       const filename = await CompressImage(req.file);
//       updateFields.attachment_file = filename;
//     }

//     // Map sectionData to updateFields
//     if (sectionData.product_name)
//       updateFields.product_name = sectionData.product_name;
//     if (sectionData.product_code)
//       updateFields.product_code = sectionData.product_code;
//     if (sectionData.type) updateFields.product_type = sectionData.type;
//     if (sectionData.product_category)
//       updateFields.product_category = sectionData.product_category;
//     if (sectionData.unit) updateFields.unit = sectionData.unit;
//     if (sectionData.tax) updateFields.tax = sectionData.tax;
//     if (sectionData.hsnCode) updateFields.hsn_code = sectionData.hsnCode;
//     if (sectionData.product_price)
//       updateFields.product_price = sectionData.product_price;
//     if (sectionData.regular_buying_price)
//       updateFields.regular_buying_price = sectionData.regular_buying_price;
//     if (sectionData.regular_selling_price)
//       updateFields.regular_selling_price = sectionData.regular_selling_price;
//     if (sectionData.dealer_price)
//       updateFields.dealer_price = sectionData.dealer_price;
//     if (sectionData.wholesale_buying_price)
//       updateFields.wholesale_buying_price = sectionData.wholesale_buying_price;
//     if (sectionData.mrp) updateFields.mrp = sectionData.mrp;
//     if (sectionData.distributor_price)
//       updateFields.distributor_price = sectionData.distributor_price;
//     if (sectionData.total_stock)
//       updateFields.total_stock = sectionData.total_stock;
//     if (sectionData.minimum_stock_level)
//       updateFields.minimum_stock_level = sectionData.minimum_stock_level;
//     if (sectionData.reject_stock)
//       updateFields.reject_stock = sectionData.reject_stock;
//     if (sectionData.maximum_stock_level)
//       updateFields.maximum_stock_level = sectionData.maximum_stock_level;
//     if (sectionData.safety_stock)
//       updateFields.safety_stock = sectionData.safety_stock;
//     if (sectionData.sku_description)
//       updateFields.sku_description = sectionData.sku_description;
//     if (sectionData.replenishment_time)
//       updateFields.replenishment_time = sectionData.replenishment_time;
//     if (sectionData.replenishment_multiplications)
//       updateFields.replenishment_multiplications =
//         sectionData.replenishment_multiplications;
//     if (sectionData.minimum_replenishment)
//       updateFields.minimum_replenishment = sectionData.minimum_replenishment;
//     if (sectionData.buffer_size)
//       updateFields.buffer_size = sectionData.buffer_size;

//     // Update the product with the new data
//     const [updatedRowsCount] = await Product.update(updateFields, {
//       where: { id: productId },
//     });

//     if (updatedRowsCount === 0) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Product not found" });
//     }

//     return res
//       .status(200)
//       .json({
//         status: true,
//         message: "Record Updated",
//         data: updatedRowsCount,
//       });
//   } catch (err) {
//     return res.status(400).json(err);
//   }
// };


exports.UpdateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const sectionData = req.body;
    const updateFields = {};

    // Handle file upload to S3
    if (req.file) {
      const company_id = req.user?.company_id;

      // Fetch company name from the database
      const company = await CompanyManagementModel.findOne({
        where: { id: company_id },
        attributes: ['company_name'],
      });
      const companyName = company?.company_name || "DefaultCompany";
      const uploadResult = await UploadFileToAWS(req.file, companyName);
      if (uploadResult.status) {
        updateFields.attachment_file = uploadResult.url;
      } else {
        return res.status(500).json({ status: false, message: uploadResult.message });
      }
    }

    // Map sectionData to updateFields
    if (sectionData.product_name)
      updateFields.product_name = sectionData.product_name;
    if (sectionData.sku_product)
      updateFields.sku_product = sectionData.sku_product;
    if (sectionData.batch_number)
      updateFields.batch_number = sectionData.batch_number;
    if (sectionData.product_code)
      updateFields.product_code = sectionData.product_code;
    if (sectionData.type) updateFields.product_type = sectionData.type;
    if (sectionData.product_category)
      updateFields.product_category = sectionData.product_category;
    if (sectionData.unit) updateFields.unit = sectionData.unit;
    if (sectionData.tax) updateFields.tax = sectionData.tax;
    if (sectionData.hsnCode) updateFields.hsn_code = sectionData.hsnCode;
    if (sectionData.product_price)
      updateFields.product_price = sectionData.product_price;
    if (sectionData.regular_buying_price)
      updateFields.regular_buying_price = sectionData.regular_buying_price;
    if (sectionData.regular_selling_price)
      updateFields.regular_selling_price = sectionData.regular_selling_price;
    if (sectionData.dealer_price)
      updateFields.dealer_price = sectionData.dealer_price;
    if (sectionData.wholesale_buying_price)
      updateFields.wholesale_buying_price = sectionData.wholesale_buying_price;
    if (sectionData.mrp) updateFields.mrp = sectionData.mrp;
    if (sectionData.distributor_price)
      updateFields.distributor_price = sectionData.distributor_price;
    if (sectionData.total_stock)
      updateFields.total_stock = sectionData.total_stock;
    if (sectionData.minimum_stock_level)
      updateFields.minimum_stock_level = sectionData.minimum_stock_level;
    if (sectionData.reject_stock)
      updateFields.reject_stock = sectionData.reject_stock;
    if (sectionData.maximum_stock_level)
      updateFields.maximum_stock_level = sectionData.maximum_stock_level;
    if (sectionData.safety_stock)
      updateFields.safety_stock = sectionData.safety_stock;
    if (sectionData.sku_description)
      updateFields.sku_description = sectionData.sku_description;
    if (sectionData.replenishment_time)
      updateFields.replenishment_time = sectionData.replenishment_time;
    if (sectionData.replenishment_multiplications)
      updateFields.replenishment_multiplications =
        sectionData.replenishment_multiplications;
    if (sectionData.minimum_replenishment)
      updateFields.minimum_replenishment = sectionData.minimum_replenishment;
    if (sectionData.buffer_size)
      updateFields.buffer_size = sectionData.buffer_size;

    console.log("xxxxxxxxxxxx", updateFields);

    // Update the product with the new data
    const [updatedRowsCount] = await Product.update(updateFields, {
      where: { id: productId },
    });

    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({
        status: true,
        message: "Record Updated",
        data: updatedRowsCount,
      });
  } catch (err) {
    return res.status(400).json(err);
  }
};

const UploadFileToAWS = async (file, companyName) => {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_AccessKeyId,
        secretAccessKey: process.env.AWS_SecretAccessKey,
      },
    });

    // Clean folder and filename
    const safeCompanyName = companyName.replace(/\s+/g, "-");
    const fileName = `${Date.now()}_${path.basename(file.originalname)}`;
    const key = `ERP/${safeCompanyName}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(uploadResult, "File uploaded to S3");

    // Construct public URL manually
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      status: true,
      message: "File uploaded successfully",
      url: fileUrl,
      filename: fileName, // optionally return filename
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      status: false,
      message: "Error uploading file",
      error,
    };
  }
};

exports.GetAllProducts = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const user_id = req.user.id;
    console.log(req.user.company_id, "xxxx");

    const getAllProduct = await Product.findAll({
      where: {
        company_id: company_id,
        // user_id: user_id,
        status: 1,
      },
      order: [["id", "DESC"]],
      include: [
        {
          model: ProductCategories,
          as: "Categories",
          attributes: ["title"],
        },
        {
          model: MasteruomModel,
          as: "Masteruom",
          attributes: ["unit_name"],
        },
        {
          model: TrackProductStock,
          as: "TrackProductStock",
          attributes: ["store_id", "quantity_changed", "status_in_out"],
          include: [
            {
              model: WarehouseModel,
              as: "Store",
              attributes: ["name"]
            }
          ]
        },

      ],
    });
    // Calculate current_stock for each product
    const formattedProducts = getAllProduct.map((product) => {
      const productData = product.toJSON();

      let stockIn = 0;
      let stockOut = 0;

      productData.TrackProductStock.forEach((entry) => {
        const qty = parseFloat(entry.quantity_changed || 0);
        if (entry.status_in_out === 1) stockIn += qty;
        else if (entry.status_in_out === 0) stockOut += qty;
      });

      return {
        ...productData,
        current_stock: stockIn - stockOut,
      };
    });

    return res.status(200).json({ message: true, data: formattedProducts });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.GetAllDeletedProducts = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const user_id = req.user.id;
    const getAlldeletedProduct = await Product.findAll({
      where: {
        company_id: company_id,
        // user_id: user_id,
        status: '0',
      },
      order: [["id", "DESC"]],
      include: [
        {
          model: ProductCategories,
          as: "Categories",
          attributes: ["title"],
        },
        {
          model: MasteruomModel,
          as: "Masteruom",
          attributes: ["unit_name"],
        },
        {
          model: TrackProductStock,
          as: "TrackProductStock",
        },
      ],
    });

    return res.status(200).json({ message: true, data: getAlldeletedProduct });
  } catch (err) {
    return res.status(400).json(err);
  }
};

//delete item restore
exports.GetAllDeletedProductsRestore = async (req, res) => {
  try {
    const { productIdsRestore } = req.body;

    console.log("Received productIds for restore:", productIdsRestore);

    if (!Array.isArray(productIdsRestore) || productIdsRestore.length === 0) {
      return res.status(400).json({ message: "Invalid or missing product IDs" });
    }

    const [updatedRowsCount] = await Product.update(
      { status: '1' },
      { where: { id: productIdsRestore } }
    );

    if (updatedRowsCount > 0) {
      return res.json({
        message: `${updatedRowsCount} products restore successfully.`,
      });
    } else {
      return res.status(404).json({ message: "No products found to restore" });
    }
  } catch (error) {
    console.error("Error restore multiple products:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.GetINDProducts = async (req, res) => {
  //return res.send('yesy');
  try {
    const productId = req.params.id;
    const getAllProduct = await Product.findOne({
      where: {
        id: productId,
      },
      order: [["id", "DESC"]],
      include: [
        { model: ProductCategories, as: "Categories", attributes: ["title"] },
        { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        { model: TrackProductStock, as: "TrackProductStock" },
      ],
    });
    return res.status(200).json({ message: true, data: getAllProduct });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.GetAllProductsbyStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    // Fetch all products for the given store
    const getAllProductsbyStore = await Product.findAll({
      where: {
        store_id: storeId,
      },
      include: [
        { model: ProductCategories, as: "Categories", attributes: ["title"] },
        { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        { model: TrackProductStock, as: "TrackProductStock" },
      ],
    });
    return res.status(200).json({ message: true, data: getAllProductsbyStore });
  } catch (err) {
    return res.status(400).json({ message: false, error: err.message });
  }
};

exports.DeleteProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findOne({ where: { id: productId } });
    if (product) {

      const updatedRowsCount = await Product.update(
        { status: "0" },
        { where: { id: productId } }
      );

      res.json({ message: "Item removed" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//bulk product delete
exports.DeleteMultipleProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    console.log("Received productIds:", productIds);

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Invalid or missing product IDs" });
    }

    const [updatedRowsCount] = await Product.update(
      { status: "0" },
      { where: { id: productIds } }
    );

    if (updatedRowsCount > 0) {
      return res.json({
        message: `${updatedRowsCount} products deleted successfully.`,
      });
    } else {
      return res.status(404).json({ message: "No products found to delete" });
    }
  } catch (error) {
    console.error("Error deleting multiple products:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.GetProductsActivity = async (req, res) => {
  try {
    const getAllProduct = await Product.findAll({
      where: {
        id: productId,
      },
      order: [["id", "DESC"]],
      include: [
        { model: ProductCategories, as: "Categories", attributes: ["title"] },
        { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        { model: TrackProductStock, as: "TrackProductStock" },
      ],
    });
    return res.status(200).json({ message: true, data: getAllProduct });
  } catch (err) {
    return res.status(400).json(err);
  }
};

//   exports.GetProductCategory = async (req, res) => {
//     try {
//         const allCategory = await categories.findAll();
//         return res.status(200).json({ "message": true, data: allCategory })
//     } catch (err) {
//         return res.status(400).json(err)
//     }
// }

exports.UpdateStockAndTrack = async (req, res) => {
  try {
    const { from_store, transferItems } = req.body;
    const referenceNumber = await generateUniqueReferenceNumber();
    // Log incoming data to verify the structure
    console.log("from_store:", from_store);
    console.log("transferItems:", transferItems);

    for (const item of transferItems) {
      //console.log('Processing item:', item); // Log each item

      if (item.itemID) {
        // Update total_stock for the matching product
        const updateResult = await Product.update(
          { total_stock: item.finalQuantity }, // Update stock with finalQuantity
          {
            where: {
              id: item.itemID, // Match the product by ID
              //store_id: from_store.value  // Match store if needed, based on product-store mapping
            },
          }
        );

        // Log update result
        console.log("Update Result:", updateResult);

        // Insert remaining data into track_product_stock
        const trackResult = await TrackProductStock.create({
          product_id: item.itemID,
          item_name: item.itemName,
          reference_number: "INV" + referenceNumber,
          barcode_number: generateRandomBarcode(),
          store_id: from_store.value, // Store ID from which the stock is transferred
          quantity_changed: item.changeQuantity, // Amount of stock changed
          final_quantity: item.finalQuantity, // Final stock quantity
          default_price: item.defaultPrice, // Default price of the product
          comment: item.comment || "", // Optional comment
          item_unit: item.itemUnit,
          user_id: req.user.id,
          company_id: req.user.company_id, // Unit of measurement
          adjustmentType: item.AdjustmentType || "adjustment", // Default to 'adjustment' if not provided
          status_in_out: 1, // Assuming 1 means stock is going in, adjust accordingly
        });

        // Log tracking result
        console.log("Track Product Stock Result:", trackResult);
      }
    }

    return res
      .status(200)
      .json({
        status: true,
        message: "Stock updated and tracked successfully",
      });
  } catch (error) {
    // Log the error for debugging
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error occurred", error: error.message });
  }
};

//update stock only
exports.UpdateStockOnly = async (req, res) => {
  try {
    const { from_store, transferItems } = req.body;

    // Log incoming data to verify the structure
    console.log("from_store:", from_store);
    console.log("transferItems:", transferItems);

    for (const item of transferItems) {
      if (item.itemID) {
        // Update total_stock for the matching product
        const updateResult = await Product.update(
          { total_stock: item.finalQuantity }, // Update stock with finalQuantity
          {
            where: {
              id: item.itemID, // Match the product by ID
              // store_id: from_store  // If your Product model is associated with store_id
            },
          }
        );

        // Log update result
        console.log("Update Result:", updateResult);
        const referenceNumber = await generateUniqueReferenceNumber();
        // Insert remaining data into track_product_stock
        const trackResult = await TrackProductStock.create({
          product_id: item.itemID,
          item_name: item.itemName,
          store_id: from_store,
          reference_number: "INV" + referenceNumber,
          barcode_number: generateRandomBarcode(),
          quantity_changed: item.changeQuantity,
          final_quantity: item.finalQuantity,
          default_price: item.defaultPrice || 0,
          comment: item.comment || "",
          item_unit: item.itemUnit,
          user_id: req.user.id,
          company_id: req.user.company_id,
          adjustmentType: item.AdjustmentType || "adjustment",
          status_in_out: item.AdjustmentType === "Out" ? 0 : 1,
        });

        // Log tracking result
        console.log("Track Product Stock Result:", trackResult);
      }
    }

    return res
      .status(200)
      .json({
        status: true,
        message: "Stock updated and tracked successfully",
      });
  } catch (error) {
    // Log the error for debugging
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error occurred", error: error.message });
  }
};

// stock transfer
exports.UpdateStockTranfer = async (req, res) => {
  try {
    const { from_store, to_store, transferItems, comment, use_fifo_price } =
      req.body;

    for (const item of transferItems) {
      if (item.itemID) {
        // Validate input data
        if (item.changeQuantity <= 0 || !to_store || !from_store) {
          return res
            .status(400)
            .json({ status: false, message: "Invalid data" });
        }
        const referenceNumber = await generateUniqueReferenceNumber();

        // Insert data for "From Store" with status_in_out = 0
        await TrackProductStock.create({
          product_id: item.itemID,
          item_name: item.itemName,
          store_id: from_store,
          reference_number: "INVR" + referenceNumber,
          barcode_number: generateRandomBarcode(), // "From Store"
          quantity_changed: item.changeQuantity, // Negative transfer quantity
          final_quantity: item.currentQuantity - item.changeQuantity, // Update the stock in "From Store"
          default_price: item.defaultPrice || 0,
          comment: item.comment || "",
          item_unit: item.itemUnit,
          adjustmentType: item.AdjustmentType || "StockTransfer",
          status_in_out: 0,
          user_id: req.user.id,
          company_id: req.user.company_id, // Out (stock is reduced from the "From Store")
          use_fifo_price: use_fifo_price || false,
        });
        // Insert data for "To Store" with status_in_out = 1
        const data = await TrackProductStock.create({
          product_id: item.itemID,
          item_name: item.itemName,
          store_id: to_store,// "To Store"
          reference_number: "INV" + referenceNumber,
          barcode_number: generateRandomBarcode(),
          quantity_changed: item.changeQuantity, // Positive transfer quantity
          final_quantity: item.finalQuantity, // Final quantity in the "To Store"
          default_price: item.defaultPrice || 0,
          comment: item.comment || "",
          item_unit: item.itemUnit,
          adjustmentType: item.AdjustmentType || "StockTransfer",
          status_in_out: 1,
          user_id: req.user.id,
          company_id: req.user.company_id, // In (stock is added to the "To Store")
          use_fifo_price: use_fifo_price || false,
        });
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "Stock transfer recorded successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error occurred", error: error.message });
  }
};

exports.StockAdjustment = async (req, res) => {
  try {
    const refID = req.params.id;
    // Fetch all products for the given store
    const getAllProductsbyStore = await TrackProductStock.findAll({
      where: {
        reference_number: refID,
      },
      include: [
        { model: CompanyManagement, as: "companyManagement", attributes: ["company_name"] },
        //     { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        //     { model: TrackProductStock, as: "TrackProductStock"},
      ],
    });


    return res.status(200).json({ message: true, data: getAllProductsbyStore });
  } catch (err) {
    return res.status(400).json({ message: false, error: err.message });
  }
};

exports.GetAllActivity = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const getAllactivitydata = await TrackProductStock.findAll({
      where: {
        company_id: company_id,
      },
      group: ["reference_number"],
      order: [["product_id", "DESC"]],
    });

    return res.status(200).json({ message: true, data: getAllactivitydata });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.referenceNumberCount = async (req, res) => {
  const referenceNumber = req.params.referenceNumber;

  try {
    const count = await TrackProductStock.count({
      where: { reference_number: referenceNumber },
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching reference number count:", error);
    res.status(500).json({ error: "Error fetching reference number count" });
  }
};

exports.getStockTransferReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const companyId = req.user.company_id;

    const dateFilter = (startDate && endDate) ? `AND t_out.created_at BETWEEN :startDate AND :endDate` : "";

    const query = `
            SELECT 
                t_out.id AS out_id,
                t_in.id AS in_id,
                t_out.product_id,
                t_out.reference_number AS out_reference_number,
                t_in.reference_number AS in_reference_number,
                t_out.quantity_changed,
                t_out.created_at,
                p.product_name,
                p.product_code,
                w_from.name AS from_location,
                w_to.name AS to_location
            FROM track_product_stock t_out
            INNER JOIN track_product_stock t_in 
                ON REPLACE(t_out.reference_number, 'INVR', 'INV') = t_in.reference_number
                AND t_out.product_id = t_in.product_id
                AND t_out.status_in_out = 0
                AND t_in.status_in_out = 1
            LEFT JOIN product p ON t_out.product_id = p.id
            LEFT JOIN warehouse_settings w_from ON t_out.store_id = w_from.id
            LEFT JOIN warehouse_settings w_to ON t_in.store_id = w_to.id
            WHERE t_out.adjustmentType = 'StockTransfer'
              AND p.company_id = :companyId
              ${dateFilter}
            ORDER BY t_out.created_at DESC;
        `;

    const replacements = { companyId };
    if (startDate && endDate) {
      replacements.startDate = new Date(startDate);
      replacements.endDate = new Date(endDate);
    }

    const transfers = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ success: true, data: transfers });
  } catch (error) {
    console.error("Stock Transfer Report Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getStockAgingReport = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { fromDate, toDate } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: "company_id is required" });
    }

    // Base SQL
    let whereClause = `t.status = 1 AND p.company_id = :company_id`;
    let replacements = { company_id };

    // Add date filters
    if (fromDate) {
      whereClause += ` AND DATE(t.created_at) >= :fromDate`;
      replacements.fromDate = fromDate;
    }
    if (toDate) {
      whereClause += ` AND DATE(t.created_at) <= :toDate`;
      replacements.toDate = toDate;
    }

    const results = await sequelize.query(`
      SELECT 
        p.product_name,
        p.product_code,
        w.name AS store_name,
        t.product_id,
        t.store_id,
        SUM(
          CASE 
            WHEN t.status_in_out = 1 THEN t.quantity_changed 
            ELSE -t.quantity_changed 
          END
        ) AS current_stock,
        MAX(t.created_at) AS last_movement_date,
        DATEDIFF(CURDATE(), MAX(t.created_at)) AS movement_day_count
      FROM 
        track_product_stock t
      JOIN 
        product p ON t.product_id = p.id
      JOIN 
        warehouse_settings w ON t.store_id = w.id
      WHERE 
        ${whereClause}
      GROUP BY 
        t.product_id, t.store_id, p.product_name, w.name
      HAVING current_stock > 0
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error in getStockAgingReport:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.getTotalProductCount = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const totalCount = await Product.count({
      where: {
        company_id: companyId,
        status: 1,
      },
    });

    res.status(200).json({ totalCount });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({ message: "Failed to fetch product count", error: error.message });
  }
};


exports.getStorewiseMonthlyStockReport = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [results] = await sequelize.query(`
      SELECT 
        tps.store_id,
        w.name AS store_name,
        DATE_FORMAT(tps.created_at, '%Y-%m') AS month,
        tps.product_id,
        SUM(CASE WHEN tps.status_in_out = 1 THEN tps.quantity_changed ELSE 0 END) AS total_in,
        SUM(CASE WHEN tps.status_in_out = 0 THEN tps.quantity_changed ELSE 0 END) AS total_out,
        (
          SUM(CASE WHEN tps.status_in_out = 1 THEN tps.quantity_changed ELSE 0 END) - 
          SUM(CASE WHEN tps.status_in_out = 0 THEN tps.quantity_changed ELSE 0 END)
        ) AS final_stock
      FROM track_product_stock tps
      JOIN warehouse_settings w ON tps.store_id = w.id
      WHERE tps.company_id = :companyId
      GROUP BY tps.store_id, w.name, month, tps.product_id
      ORDER BY month DESC, tps.store_id, tps.product_id;
    `, {
      replacements: { companyId },
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error generating stock report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock report",
      error: error.message,
    });
  }
};


exports.getProductStockMaintenanceReport = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [results] = await sequelize.query(`
      SELECT 
        p.product_name,
        p.product_code,
        w.name AS store_name,
        SUM(CASE 
              WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
              THEN tps.quantity_changed ELSE 0 
            END) AS total_in,
        SUM(CASE 
              WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
              THEN tps.quantity_changed ELSE 0 
            END) AS total_out,
        (
          SUM(CASE 
                WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
                THEN tps.quantity_changed ELSE 0 
              END) - 
          SUM(CASE 
                WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
                THEN tps.quantity_changed ELSE 0 
              END)
        ) AS current_stock,
        p.minimum_stock_level,
        CASE 
          WHEN (
            SUM(CASE 
                  WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END) - 
            SUM(CASE 
                  WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END)
          ) < p.minimum_stock_level
          THEN p.minimum_stock_level - (
            SUM(CASE 
                  WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END) - 
            SUM(CASE 
                  WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END)
          )
          ELSE 0
        END AS need,
        CASE 
          WHEN (
            SUM(CASE 
                  WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END) - 
            SUM(CASE 
                  WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END)
          ) > p.minimum_stock_level
          THEN (
            SUM(CASE 
                  WHEN tps.status_in_out = 1 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END) - 
            SUM(CASE 
                  WHEN tps.status_in_out = 0 AND tps.store_id = p.store_id 
                  THEN tps.quantity_changed ELSE 0 
                END)
          ) - p.minimum_stock_level
          ELSE 0
        END AS excess
      FROM product p
      LEFT JOIN track_product_stock tps ON tps.product_id = p.id
      LEFT JOIN warehouse_settings w ON w.id = p.store_id
      WHERE p.status = 1 AND p.company_id = :companyId
      GROUP BY p.product_name, p.product_code, p.minimum_stock_level, w.name
      ORDER BY p.product_name ASC;
    `, {
      replacements: { companyId }
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Stock Maintenance Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock maintenance report.",
      error: error.message
    });
  }
};

exports.getSlowMovingItemReport = async (req, res) => {
  try {
    // Fetch the latest OUT movement date (status_in_out = 0)
    const latestMovements = await TrackProductStock.findAll({
      where: {
        status_in_out: 0, // Only outgoing movement
        company_id: req.user.company_id
      },
      attributes: [
        'product_id',
        'store_id',
        [TrackProductStock.sequelize.fn('MAX', TrackProductStock.sequelize.col('created_at')), 'last_movement_date']
      ],
      group: ['product_id', 'store_id'],
      raw: true
    });

    // Map to retrieve latest movement per product/store
    const result = await Promise.all(latestMovements.map(async (entry) => {
      const product = await Product.findByPk(entry.product_id);
      const store = await WarehouseModel.findByPk(entry.store_id);

      if (!product || !store) return null;

      const lastMovementDate = moment(entry.last_movement_date);
      const today = moment();
      const daysSinceMovement = today.diff(lastMovementDate, 'days');

      return {
        product_name: product.product_name,
        product_code: product.product_code,
        item_location: store.name,
        item_cost: product.default_price,
        last_movement_date: lastMovementDate.format('YYYY-MM-DD'),
        days_since_last_movement: daysSinceMovement
      };
    }));

    const filtered = result.filter(item => item !== null);
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching slow moving item report:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.getDeadStockReport = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const products = await Product.findAll({
      where: {
        company_id,
        status: 1,
      },
      include: [
        {
          model: TrackProductStock,
          as: "TrackProductStock",
          attributes: [],
          where: { company_id },
          required: false,
        },
        {
          model: MasteruomModel,
          as: "Masteruom",
          attributes: ["unit_name"],
        },
        {
          model: ProductCategories,
          as: "Categories",
          attributes: ["title"],
        },
      ],
      attributes: {
        include: [
          // ✅ Correct current stock: IN - OUT
          [
            literal(`(
              SELECT 
                COALESCE(SUM(CASE WHEN status_in_out = 1 THEN quantity_changed ELSE 0 END), 0) 
                - 
                COALESCE(SUM(CASE WHEN status_in_out = 0 THEN quantity_changed ELSE 0 END), 0)
              FROM track_product_stock 
              WHERE track_product_stock.product_id = product.id
              AND track_product_stock.company_id = '${company_id}'
            )`),
            "current_stock",
          ],
          // ✅ Last dispatch date (status_in_out = 0)
          [
            literal(`(
              SELECT MAX(created_at)
              FROM track_product_stock
              WHERE track_product_stock.product_id = product.id
              AND track_product_stock.status_in_out = 0
              AND track_product_stock.company_id = '${company_id}'
            )`),
            "last_dispatch_date",
          ],
        ],
      },
      order: [["product_name", "ASC"]],
    });

    const deadStockList = products
      .map((p) => {
        const stock = parseInt(p.dataValues.current_stock || 0);
        return {
          product_id: p.id,
          product_name: p.product_name,
          product_code: p.product_code,
          category: p.Categories?.title || "-",
          unit: p.Masteruom?.unit_name || "-",
          current_stock: stock,
          last_dispatch_date: p.dataValues.last_dispatch_date,
        };
      })
      .filter((item) => item.current_stock > 0); // Optional: filter only stocked items

    return res.status(200).json({
      success: true,
      data: deadStockList,
    });

  } catch (error) {
    console.error("Dead stock report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dead stock report",
      error: error.message,
    });
  }
};

exports.getStockValuation = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const result = await TrackProductStock.findAll({
      where: { company_id },
      attributes: [
        'product_id',
        'item_name',
        'item_unit',
        'default_price',
        [fn('SUM', literal(`CASE WHEN status_in_out = 1 THEN quantity_changed ELSE -quantity_changed END`)), 'total_quantity']
      ],
      group: ['product_id', 'item_name', 'item_unit', 'default_price']
    });

    const valuation = result.map(row => ({
      product_id: row.product_id,
      item_name: row.item_name,
      quantity: parseFloat(row.getDataValue('total_quantity')),
      unit: row.item_unit,
      price: row.default_price,
      stock_value: parseFloat(row.getDataValue('total_quantity')) * (row.default_price || 0),
    }));

    const totalValue = valuation.reduce((sum, item) => sum + item.stock_value, 0);
    res.json({ valuation, totalValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stock Levels
exports.getStockLevels = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const result = await TrackProductStock.findAll({
      where: { company_id },
      attributes: [
        'product_id',
        [fn('SUM', literal(`CASE WHEN status_in_out = 1 THEN quantity_changed ELSE -quantity_changed END`)), 'total_quantity']
      ],
      group: ['product_id']
    });

    const stats = {
      negative: 0,
      low: 0,
      reorder: 0,
      optimum: 0,
      high: 0,
      excess: 0,
    };

    result.forEach(r => {
      const qty = parseFloat(r.getDataValue('total_quantity'));
      if (qty < 0) stats.negative++;
      else if (qty === 0) stats.low++;
      else if (qty < 50) stats.reorder++;
      else if (qty < 200) stats.optimum++;
      else if (qty < 500) stats.high++;
      else stats.excess++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Inventory Performance
exports.getInventoryPerformance = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const result = await TrackProductStock.findAll({
      where: { company_id },
      attributes: [
        [literal('YEARWEEK(created_at, 1)'), 'week'],
        'status_in_out',
        [fn('SUM', col('quantity_changed')), 'total']
      ],
      group: ['week', 'status_in_out'],
      order: [literal('week ASC')],
    });

    const grouped = {};
    result.forEach(entry => {
      const week = entry.getDataValue('week');
      const status = entry.getDataValue('status_in_out');
      const total = parseFloat(entry.getDataValue('total') || 0);

      if (!grouped[week]) {
        grouped[week] = { Inward: 0, Outward: 0 };
      }

      if (status === 1) grouped[week].Inward += total;
      else if (status === 0) grouped[week].Outward += total;
    });

    const sortedWeeks = Object.keys(grouped).sort();
    const labels = sortedWeeks.map(weekStr => {
      const year = weekStr.slice(0, 4);
      const week = weekStr.slice(4);
      return `Week ${week} - ${year}`;
    });

    const inwardData = sortedWeeks.map(week => grouped[week].Inward);
    const outwardData = sortedWeeks.map(week => grouped[week].Outward);

    res.json({
      labels,
      datasets: {
        Inward: inwardData,
        Outward: outwardData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory performance.' });
  }
};

// Top Items
exports.getTopItems = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Top Selling Items
    const topSelling = await TrackProductStock.findAll({
      where: {
        company_id,
        status_in_out: 0,
        created_at: { [Op.gte]: threeMonthsAgo },
      },
      attributes: [
        'item_name',
        [fn('COUNT', fn('DISTINCT', col('reference_number'))), 'invoice_count'],
        [fn('SUM', literal('quantity_changed * default_price')), 'traded_amount'],
      ],
      group: ['item_name'],
      order: [[literal('traded_amount'), 'DESC']],
      limit: 5,
    });

    // Top Purchased Items
    const topPurchased = await TrackProductStock.findAll({
      where: {
        company_id,
        status_in_out: 1,
        created_at: { [Op.gte]: threeMonthsAgo },
      },
      attributes: [
        'item_name',
        [fn('COUNT', fn('DISTINCT', col('reference_number'))), 'invoice_count'],
        [fn('SUM', literal('quantity_changed * default_price')), 'traded_amount'],
      ],
      group: ['item_name'],
      order: [[literal('traded_amount'), 'DESC']],
      limit: 5,
    });

    res.json({
      topSelling: topSelling.map(item => ({
        item_name: item.item_name,
        invoice_count: parseInt(item.getDataValue('invoice_count')),
        traded_amount: parseFloat(item.getDataValue('traded_amount') || 0),
      })),
      topPurchased: topPurchased.map(item => ({
        item_name: item.item_name,
        invoice_count: parseInt(item.getDataValue('invoice_count')),
        traded_amount: parseFloat(item.getDataValue('traded_amount') || 0),
      })),
    });
  } catch (error) {
    console.error('Error in getTopItems:', error);
    res.status(500).json({ error: 'Failed to fetch top items.' });
  }
};

// Inventory Overview
exports.getInventoryOverview = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const result = await TrackProductStock.findAll({
      where: { company_id },
      attributes: [
        'product_id',
        [fn('SUM', literal(`CASE WHEN status_in_out = 1 THEN quantity_changed ELSE -quantity_changed END`)), 'net_quantity'],
        'default_price'
      ],
      group: ['product_id', 'default_price']
    });

    let totalValuation = 0;
    const uniqueItems = new Set();

    result.forEach(row => {
      const qty = parseFloat(row.getDataValue('net_quantity') || 0);
      const price = parseFloat(row.default_price || 0);
      const value = qty * price;

      totalValuation += value;
      uniqueItems.add(row.product_id);
    });

    res.json({
      totalItems: uniqueItems.size,
      totalValuation: parseFloat(totalValuation.toFixed(2))
    });
  } catch (error) {
    console.error('Error in getInventoryOverview:', error);
    res.status(500).json({ error: 'Failed to fetch inventory overview.' });
  }
};



// api for low qty alert -------------------------------------------------------------------

exports.GetLowQtyProducts = async (req, res) => {
  try {
    const getAllProduct = await Product.findAll({
      where: { status: 1 },
      order: [["id", "DESC"]],
      include: [
        { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        {
          model: TrackProductStock,
          as: "TrackProductStock",
          attributes: ["store_id", "quantity_changed", "status_in_out"],
        },
      ],
    });

    // Group low stock products by company_id
    const companyLowStockMap = {};

    for (const product of getAllProduct) {
      const productData = product.toJSON();

      let stockIn = 0, stockOut = 0;

      productData.TrackProductStock.forEach((entry) => {
        const qty = parseFloat(entry.quantity_changed || 0);
        if (entry.status_in_out === 1) stockIn += qty;
        else stockOut += qty;
      });

      const currentStock = stockIn - stockOut;
      const minStock = parseFloat(productData.minimum_stock_level || 0);

      if (currentStock < minStock) {
        if (!companyLowStockMap[productData.company_id]) {
          companyLowStockMap[productData.company_id] = {
            products: [],
          };
        }

        companyLowStockMap[productData.company_id].products.push({
          product_name: productData.product_name,
          current_stock: currentStock,
          minimum_stock_level: minStock,
        });
      }
    }

    const sentMessages = [];

    // Loop through companies that have low stock products
    for (const companyId in companyLowStockMap) {
      const companyDetails = await CompanyManagementModel.findOne({
        where: { id: companyId },
        attributes: ["company_name", "whatsapp_number", "p_isd"]
      });

      const whatsappConfig = await GeneralSettings.findOne({
        where: { company_id: companyId, is_active: 1 },
        attributes: ["gupshup_token", "gupshup_phone"]
      });

      if (!companyDetails?.whatsapp_number || !whatsappConfig?.gupshup_token || !whatsappConfig?.gupshup_phone) {
        console.log(`⚠️ Skipping company ${companyId} due to missing WhatsApp config.`);
        continue;
      }

      const lowStockList = companyLowStockMap[companyId].products;
      const totalLowStock = lowStockList.length;

      const productSummary = lowStockList.map((p, idx) =>
        `${idx + 1}) ${p.product_name} [C:${p.current_stock}, M:${p.minimum_stock_level}]`
      ).join(' | '); // Avoid line breaks for WhatsApp template compatibility

      const templateParams = [
        companyDetails.company_name,                                   // {{1}} Company Name
        `${totalLowStock} product${totalLowStock > 1 ? 's' : ''}`,     // {{2}} Count
        productSummary,                                                 // {{3}} Product list
      ];

      // Send WhatsApp via GupShup
      await GupShupMessage(
        companyDetails.p_isd || "91",                                  // ISD
        companyDetails.whatsapp_number,
        whatsappConfig.gupshup_token,
        whatsappConfig.gupshup_phone,
        "ad66535c-ded4-484b-b1b7-372c576deba6",                         // Your approved 5-var template ID
        templateParams
      );

      sentMessages.push({
        company_name: companyDetails.company_name,
        whatsapp_number: companyDetails.whatsapp_number,
        total_low_stock: totalLowStock,
        products: lowStockList,
      });
    }

    return res.status(200).json({
      message: true,
      companies_notified: sentMessages.length,
      details: sentMessages
    });

  } catch (err) {
    console.error("Low stock error:", err);
    return res.status(400).json({ error: err.message });
  }
};


exports.GetOverStockProducts = async (req, res) => {
  try {
    const getAllProduct = await Product.findAll({
      where: { status: 1 },
      order: [["id", "DESC"]],
      include: [
        { model: MasteruomModel, as: "Masteruom", attributes: ["unit_name"] },
        {
          model: TrackProductStock,
          as: "TrackProductStock",
          attributes: ["store_id", "quantity_changed", "status_in_out"],
        },
      ],
    });

    const companyOverStockMap = {};

    for (const product of getAllProduct) {
      const productData = product.toJSON();

      let stockIn = 0, stockOut = 0;

      productData.TrackProductStock.forEach((entry) => {
        const qty = parseFloat(entry.quantity_changed || 0);
        if (entry.status_in_out === 1) stockIn += qty;
        else stockOut += qty;
      });

      const currentStock = stockIn - stockOut;
      const maxStock = parseFloat(productData.maximum_stock_level || 0);

      if (maxStock && currentStock > maxStock) {
        if (!companyOverStockMap[productData.company_id]) {
          companyOverStockMap[productData.company_id] = {
            products: [],
          };
        }

        companyOverStockMap[productData.company_id].products.push({
          product_name: productData.product_name,
          current_stock: currentStock,
          maximum_stock_level: maxStock,
        });
      }
    }

    const sentMessages = [];

    for (const companyId in companyOverStockMap) {
      const companyDetails = await CompanyManagementModel.findOne({
        where: { id: companyId },
        attributes: ["company_name", "whatsapp_number", "p_isd"]
      });

      const whatsappConfig = await GeneralSettings.findOne({
        where: { company_id: companyId, is_active: 1 },
        attributes: ["gupshup_token", "gupshup_phone"]
      });

      if (!companyDetails?.whatsapp_number || !whatsappConfig?.gupshup_token || !whatsappConfig?.gupshup_phone) {
        console.log(`⚠️ Skipping company ${companyId} due to missing or inactive WhatsApp config.`);
        continue;
      }

      const overStockList = companyOverStockMap[companyId].products;
      const totalOverStock = overStockList.length;

      const productSummary = overStockList.map((p, idx) =>
        `${idx + 1}) ${p.product_name} [C:${p.current_stock}, M:${p.maximum_stock_level}]`
      ).join(' | ');

      const templateParams = [
        companyDetails.company_name,                                      // {{1}}
        `${totalOverStock} product${totalOverStock > 1 ? 's' : ''}`,      // {{2}}
        productSummary,                                                   // {{3}}                           
      ];

      await GupShupMessage(
        companyDetails.p_isd || "91",
        companyDetails.whatsapp_number,
        whatsappConfig.gupshup_token,
        whatsappConfig.gupshup_phone,
        "c626d7aa-f02a-457c-920d-1e3af84cc463",                           // Template ID
        templateParams
      );

      sentMessages.push({
        company_name: companyDetails.company_name,
        whatsapp_number: companyDetails.whatsapp_number,
        total_over_stock: totalOverStock,
        products: overStockList,
      });
    }

    return res.status(200).json({
      message: true,
      companies_notified: sentMessages.length,
      details: sentMessages
    });

  } catch (err) {
    console.error("Overstock error:", err);
    return res.status(400).json({ error: err.message });
  }
};







// api end for low qty alert








const TOGETHER_API_KEY = '5d764e27aec4baf02d0a9c47f668492fe78251de70895943c199cfa2d38f893b'; // Replace with your actual key

exports.generateProductReport = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt and company_id are required.' });
    }

    // Fetch products with all relations
    const products = await Product.findAll({
      where: { company_id: req.user.company_id, status: 1 },
      include: [
        {
          model: ProductCategories,
          as: 'Categories',
          attributes: ['title']
        },
        {
          model: MasteruomModel,
          as: 'Masteruom',
          attributes: ['unit_name']
        },
        {
          model: TrackProductStock,
          as: 'TrackProductStock',
          attributes: ['quantity_changed', 'status_in_out', 'store_id'],
          include: [
            {
              model: WarehouseModel,
              as: 'Store',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    // Aggregate stock data per product per store
    const structuredData = [];

    products.forEach(product => {
      const stockGroups = {};

      product.TrackProductStock?.forEach(entry => {
        const storeName = entry.Store?.name || 'Unknown';

        if (!stockGroups[storeName]) {
          stockGroups[storeName] = { stock_in: 0, stock_out: 0 };
        }

        if (entry.status_in_out === 1) {
          stockGroups[storeName].stock_in += entry.quantity_changed;
        } else if (entry.status_in_out === 0) {
          stockGroups[storeName].stock_out += entry.quantity_changed;
        }
      });

      Object.entries(stockGroups).forEach(([store, stock]) => {
        structuredData.push({
          store,
          product_name: product.product_name,
          product_code: product.product_code,
          category: product.Categories?.title,
          unit: product.Masteruom?.unit_name,


          min_stock: product.minimum_stock_level,
          max_stock: product.maximum_stock_level,
          current_stock: stock.stock_in - stock.stock_out,
          stock_in: stock.stock_in,
          stock_out: stock.stock_out,
        });
      });
    });

    // Send to Together AI
    const finalPrompt = `
You are an inventory analyst. Based on the user request and the following product inventory data (store-wise), generate a detailed inventory report.

User Request:
${prompt}

Inventory Data:
${JSON.stringify(structuredData, null, 2)}
    `;

    const aiResponse = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: finalPrompt }],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const report = aiResponse.data.choices[0].message.content;
    return res.status(200).json({ report });

  } catch (error) {
    console.error('AI Universal Report Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate inventory report.' });
  }
};