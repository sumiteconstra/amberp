const { where, Sequelize, Op, QueryTypes, fn, col } = require("sequelize");

const User = require("../model/User");
const {
  Purchase,
  PurchaseProduct,
  Remarks,
  Followup,
  sequelize,
  AdvancePayment,
} = require("../model/Purchase");
const puppeteer = require('puppeteer');

const wkhtmltopdf = require('wkhtmltopdf');
const htmlPdf = require('html-pdf-node');

const fs = require('fs');
const path = require('path');
const generateUniqueReferenceNumber = require("../utils/generateReferenceNumber");


const options = {
  timeout: 30000 // Timeout in milliseconds (30 seconds)
};
const numberToWords = require('number-to-words');
const handlebars = require('handlebars');
const Vendor = require("../model/Vendor");
const Product = require("../model/Product");
const Bill = require("../model/Bill");
const BillProduct = require("../model/BillProduct");
const Payment = require("../model/RegisterPayment");
const { required } = require("joi");
const { sendMail, GreenApiWhatsappNotification, MaytapiWhatsappNotification, MaytapiWhatsappNotificationmedia } = require("../utils/Helper");
const nodemailer = require('nodemailer');
// Adjust the path as necessary

const Recv = require("../model/Recv");
const RecvProduct = require("../model/RecvProduct");
const { log } = require("console");
const { GeneralSettings, CompanyModel } = require("../model/CompanyModel");
const WarehouseModel = require("../model/WarehouseModel");
const TrackProductStock = require("../model/TrackProductStock");
exports.AddPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const referenceNumber = await generateUniqueReferenceNumber();
    console.log("Creating Purchase...");
    const purchaseData = await Purchase.create(
      {
        reference_number: referenceNumber,
        vendor_id: req.body.vendor_id,
        vendor_reference: req.body.vendor_reference,
        order_dateline: req.body.order_dateline,
        expected_arrival: req.body.expected_arrival,
        buyer: req.body.buyer,
        source_document: req.body.source_document,
        payment_terms: req.body.payment_terms,
        total_amount: req.body.total_amount,
        untaxed_amount: req.body.untaxed_amount,
        is_parent: req.body.is_parent,
        is_parent_id: req.body.is_parent_id,
        user_id: req.user.id,
        company_id: req.user.company_id,
        mailsend_status: req.body.mailsend_status || '0'
      },
      { transaction }
    );

    if (req.body.products && req.body.products.length > 0) {
      console.log("Creating Purchase Products...");
      const productPromises = req.body.products.map(async (product) => {
        // Calculate product total including tax
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;

        // Create PurchaseProduct record
        await PurchaseProduct.create(
          {
            purchase_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            taxExcl: product.taxExcl,
            taxIncl: product.taxIncl, // Store total including tax
            vendor_id: req.body.vendor_id,
            taxAmount: product.taxAmount,
            user_id: req.user.id,
            company_id: req.user.company_id,
          },
          { transaction }
        );
      });

      await Promise.all(productPromises);
      console.log("All Purchase Products created.");

      // Calculate total purchase amount including tax
      const totalPurchaseAmount = req.body.products.reduce((total, product) => {
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;
        return total + totalWithTax;
      }, 0);

      // Update the purchase record with total amount
      await Purchase.update(
        {
          total_amount: totalPurchaseAmount,
        },
        {
          where: { id: purchaseData.id },
          transaction,
        }
      );

      // Update PurchaseProduct with total amount (if needed)
      await PurchaseProduct.update(
        {
          total_amount: totalPurchaseAmount,
        },
        {
          where: { purchase_id: purchaseData.id },
          transaction,
        }
      );

      console.log("Total Purchase Amount updated:", totalPurchaseAmount);
    }

    await transaction.commit();
    console.log("Transaction committed.");

    // Fetch the updated purchase data to respond with
    const updatedPurchase = await Purchase.findByPk(purchaseData.id);

    // Return the updated purchase data including total amount to the client
    res.status(201).json({
      ...updatedPurchase.toJSON(),
      total_amount: updatedPurchase.total_amount,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    // res.status(500).json({
    //   error: "An error occurred while creating the purchase and products",
    // });
  }
};

exports.AddPurchaseadditi = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const referenceNumber = await generateUniqueReferenceNumber();
    console.log("Creating Purchase...");
    const purchaseData = await Purchase.create(
      {
        reference_number: referenceNumber,
        vendor_id: req.body.vendor_id,
        vendor_reference: req.body.vendor_reference,
        order_dateline: req.body.order_dateline,
        expected_arrival: req.body.expected_arrival,
        buyer: req.body.buyer,
        source_document: req.body.source_document,
        payment_terms: req.body.payment_terms,
        total_amount: req.body.total_amount,
        untaxed_amount: req.body.untaxed_amount,
        is_parent: req.body.is_parent,
        is_parent_id: req.body.is_parent_id,
        parent_recd_id: req.body.parent_recd_id,
        user_id: req.user.id,
        company_id: req.user.company_id,
        mailsend_status: req.body.mailsend_status || '0'
      },
      { transaction }
    );

    if (req.body.products && req.body.products.length > 0) {
      console.log("Creating Purchase Products...");
      const productPromises = req.body.products.map(async (product) => {
        // Calculate product total including tax
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;

        // Create PurchaseProduct record
        await PurchaseProduct.create(
          {
            purchase_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            taxExcl: productTotal,
            taxIncl: totalWithTax,
            taxAmount: product.taxAmount,
            vendor_id: req.body.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
          },
          { transaction }
        );
      });

      await Promise.all(productPromises);
      console.log("All Purchase Products created.");

      // Calculate total purchase amount including tax
      const totalPurchaseAmount = req.body.products.reduce((total, product) => {
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;
        return total + totalWithTax;
      }, 0);

      // Update the purchase record with total amount
      await Purchase.update(
        {
          total_amount: totalPurchaseAmount,
        },
        {
          where: { id: purchaseData.id },
          transaction,
        }
      );

      // Update PurchaseProduct with total amount (if needed)
      await PurchaseProduct.update(
        {
          total_amount: totalPurchaseAmount,
        },
        {
          where: { purchase_id: purchaseData.id },
          transaction,
        }
      );

      console.log("Total Purchase Amount updated:", totalPurchaseAmount);
    }

    await transaction.commit();
    console.log("Transaction committed.");

    // Fetch the updated purchase data to respond with
    const updatedPurchase = await Purchase.findByPk(purchaseData.id);

    // Return the updated purchase data including total amount to the client
    res.status(201).json({
      ...updatedPurchase.toJSON(),
      total_amount: updatedPurchase.total_amount,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    res.status(500).json({
      error: "An error occurred while creating the purchase and products",
    });
  }
};

exports.UpdatePurchase = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Purchase ID is required" });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log(`Received request to update Purchase with id: ${id}`);
    console.log("Request body:", req.body);

    // Validate the request body
    if (
      !req.body.vendor_id ||
      !req.body.products ||
      req.body.products.length === 0
    ) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Verify the purchase exists before updating
    const purchaseExists = await Purchase.findByPk(id);
    if (!purchaseExists) {
      await transaction.rollback();
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Update Purchase details
    await Purchase.update(
      {
        vendor_id: req.body.vendor_id,
        vendor_reference: req.body.vendor_reference,
        order_dateline: req.body.order_dateline,
        expected_arrival: req.body.expected_arrival,
        buyer: req.body.buyer,
        source_document: req.body.source_document,
        payment_terms: req.body.payment_terms,
        total_amount: req.body.total_amount,
        untaxed_amount: req.body.untaxed_amount,
        user_id: req.user.id,
        company_id: req.user.company_id,
      },
      {
        where: { id },
        transaction,
      }
    );

    // Delete existing PurchaseProducts
    await PurchaseProduct.destroy({
      where: { purchase_id: id },
      transaction,
    });

    let totalPurchaseAmount = 0;

    // Create new PurchaseProducts
    const productPromises = req.body.products.map(async (product) => {
      const qty = parseFloat(product.qty) || 0;
      const unitPrice = parseFloat(product.unit_price) || 0;
      const taxRate = parseFloat(product.tax) || 0;

      const productTotal = qty * unitPrice;
      const taxAmount = (taxRate / 100) * productTotal;
      const totalWithTax = productTotal + taxAmount;

      totalPurchaseAmount += totalWithTax;

      await PurchaseProduct.create(
        {
          purchase_id: id,
          product_id: product.product_id,
          description: product.description,
          qty,
          unit_price: unitPrice,
          tax: taxRate,
          taxExcl: productTotal,
          tax_amount: taxAmount,
          taxIncl: totalWithTax,
          vendor_id: product.vendor_id,
          user_id: req.user.id,
          company_id: req.user.company_id,
        },
        { transaction, validate: true }
      );
    });

    await Promise.all(productPromises);

    // Update total amount in Purchase
    await Purchase.update(
      {
        total_amount: totalPurchaseAmount,
      },
      {
        where: { id },
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();

    const updatedPurchase = await Purchase.findByPk(id);
    if (!updatedPurchase) {
      return res.status(404).json({ error: "Purchase not found after update" });
    }

    res.status(200).json({
      ...updatedPurchase.toJSON(),
      total_amount: totalPurchaseAmount,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    res.status(500).json({
      error: "An error occurred while updating the purchase and products",
    });
  }
};



exports.GetAllPurchase = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.lt]: 5 },
              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

exports.GetAllPurchaseRfqStatus = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 2 },

              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

exports.GetAllPurchasereviewdone = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 4 },

              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};
exports.GetAllPurchaseBilled = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 6 },

              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};
exports.GetAllPurchaseRfqReview = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 3 },

              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};
//show all reject
exports.GetAllPurchaseReject = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 8 },

              ]
            }
          ]
        }
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log('Products fetched:', products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

exports.getPurchase = async (req, res) => {
  try {
    const purchaseData = await Purchase.findOne({
      where: {
        id: req.params.id,
        company_id: req.user.company_id,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Vendor, as: "vendor" },
        { model: AdvancePayment, as: "advance" },
      ],
    });

    if (!purchaseData) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Step 1: Get sum of 'received' quantities per product from RecvProduct
    const receivedData = await RecvProduct.findAll({
      where: { purchase_id: req.params.id },
      attributes: [
        "product_id",
        [fn("SUM", col("received")), "total_received"],
      ],
      group: ["product_id"],
    });

    // Step 2: Create a map of product_id -> total_received
    const receivedMap = {};
    receivedData.forEach((item) => {
      receivedMap[item.product_id] = parseInt(item.dataValues.total_received) || 0;
    });

    // Step 3: Add 'received' to each product
    const productsWithReceived = purchaseData.products.map((product) => {
      const productJson = product.toJSON();
      productJson.received = receivedMap[product.product_id] || 0;
      return productJson;
    });

    // Step 4: Return updated JSON with received included in products
    const finalData = purchaseData.toJSON();
    finalData.products = productsWithReceived;

    return res.status(200).json(finalData);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return res.status(500).json({ error: "An error occurred while fetching the purchase" });
  }
};

// exports.getPurchase = async (req, res) => {
//   //return res.send('yesy');
//   //   try {
//   const purchaseData = await Purchase.findOne({
//     where: {
//       id: req.params.id,
//       company_id: req.user.company_id,

//     },
//     include: [
//       {
//         model: PurchaseProduct,
//         as: "products",
//         include: [{ model: Product, as: "ProductsItem" }],
//       },
//       { model: Vendor, as: "vendor" },
//       { model: AdvancePayment, as: "advance" },
//     ],
//   });

//   if (!purchaseData) {
//     return res.status(404).json({ error: "Purchase not found" });
//   }

//   res.status(200).json(purchaseData);
//   //   } catch (error) {
//   //     console.error("Error fetching purchase:", error);
//   //     res
//   //       .status(500)
//   //       .json({ error: "An error occurred while fetching the purchase" });
//   //   }
// };

exports.getPurchaseaddi = async (req, res) => {
  const { id, venid } = req.params;

  //   try {
  const purchaseData = await Purchase.findAll({
    where: {
      parent_recd_id: id,
      is_parent_id: venid,
      company_id: req.user.company_id,

      status: { [Op.ne]: 0 },
    },
    include: [
      {
        model: PurchaseProduct,
        as: "products",
        include: [{ model: Product, as: "ProductsItem" }],
      },
      { model: Vendor, as: "vendor" },
    ],
  });

  if (!purchaseData) {
    return res.status(404).json({ error: "Purchase not found" });
  }

  res.status(200).json(purchaseData);
  //   } catch (error) {
  //     console.error("Error fetching purchase:", error);
  //     res
  //       .status(500)
  //       .json({ error: "An error occurred while fetching the purchase" });
  //   }
};
exports.getPurchasecompare = async (req, res) => {
  //   try {
  const purchaseData = await Purchase.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [{ id: req.params.id }, { parent_recd_id: req.params.id }],
        },
        { company_id: req.user.company_id },
        { user_id: req.user.id },
        { status: { [Op.ne]: 0 } },
      ],
    },
    include: [
      {
        model: PurchaseProduct,
        as: "products",
        include: [{ model: Product, as: "ProductsItem" }],
      },
      { model: Vendor, as: "vendor" },
    ],
  });

  if (!purchaseData) {
    return res.status(404).json({ error: "Purchase not found" });
  }

  res.status(200).json(purchaseData);
  //   } catch (error) {
  //     console.error("Error fetching purchase:", error);
  //     res
  //       .status(500)
  //       .json({ error: "An error occurred while fetching the purchase" });
  //   }
};

exports.getPurchasecompareManagment = async (req, res) => {
  //   try {
  // return res.send(req.params.id);
  const purchaseData = await Purchase.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [{ id: req.params.id }, { parent_recd_id: req.params.id }],
        },
        { status: { [Op.ne]: 0 } },
      ],
    },
    include: [
      {
        model: PurchaseProduct,
        as: "products",
        include: [{ model: Product, as: "ProductsItem" }],
      },
      { model: Vendor, as: "vendor" },
      { model: Remarks, as: "remarkdata" },
    ],
  });

  if (!purchaseData) {
    return res.status(404).json({ error: "Purchase not found" });
  }

  res.status(200).json(purchaseData);
};


exports.StatusUpdate = async (req, res) => {
  const { id, sid } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const purchaseId = req.params.id;
    console.log(purchaseId);

    // Validate purchaseId
    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({ error: "Invalid purchase ID" });
    }

    // Fetch the main purchase record
    const purchase = await Purchase.findOne({ where: { id: purchaseId }, transaction });

    if (!purchase) {
      await transaction.rollback();
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Fetch all related records
    const relatedPurchases = await Purchase.findAll({
      where: { parent_recd_id: purchaseId },
      transaction,
    });

    // Filter out records with status 8
    const recordsToUpdate = relatedPurchases.filter(record => record.status !== 8);

    if (purchase.status !== 8) {
      recordsToUpdate.push(purchase);
    }

    // Update the status of the remaining records
    for (const record of recordsToUpdate) {
      let updateFields = { status: sid };
      if (sid == 5) {
        updateFields.order_dateline = new Date();
      }
      await Purchase.update(updateFields, {
        where: { id: record.id },
        transaction,
      });
    }

    //sendMail('sumit.econstra@gmail.com', 'New Purchase Request for Approval', 'New Purchase Request for Approval');
    // MaytapiWhatsappNotification("919163220851", "New Purchase Request for Approval");

    await transaction.commit();

    return res.status(200).json({ message: "Records Updated" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    return res.status(500).json({
      error: "An error occurred while marking the purchase and related purchases as deleted",
    });
  }
};




exports.DeletePurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const purchaseData = await Purchase.findOne({
      where: { id: req.params.id },
      include: [PurchaseProduct],
    });

    if (!purchaseData) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    if (purchaseData.is_parent == 0) {
      await purchaseData.update({ status: 0 }, { transaction });

      await PurchaseProduct.update(
        { status: 0 },
        { where: { purchase_id: purchaseData.id }, transaction }
      );

      await transaction.commit();
      res
        .status(200)
        .json({ message: "Purchase and products marked as deleted" });
    } else {
      res.status(205).json({
        error:
          "An error occurred while marking the purchase and products as deleted",
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    res.status(500).json({
      error:
        "An error occurred while marking the purchase and products as deleted",
    });
  }
};

exports.GetAllPurchaseOrder = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        [Op.and]: [
          {
            status: {
              [Op.gte]: 5
            }
          },
          {
            status: {
              [Op.ne]: 8
            }
          },
          {
            status: {
              [Op.ne]: 9
            }
          },
          {
            status: {
              [Op.ne]: 10
            }
          },
          {
            status: {
              [Op.ne]: 7
            }
          }
        ]
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
        {
          model: AdvancePayment,
          as: "advance",
        },
        {
          model: Followup,
          as: "followup",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//recv done
exports.GetAllPurchaseOrderRecvDone = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,

        status: 10,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
        {
          model: AdvancePayment,
          as: "advance",
        },
        {
          model: Followup,
          as: "followup",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Send the response with the fetched data
    res.json(products);
  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//done list
exports.GetAllPurchaseOrderDone = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 7,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
        {
          model: AdvancePayment,
          as: "advance",
        },
        {
          model: Followup,
          as: "followup",
        },
        {
          model: Bill,
          as: "bill",
          attributes: ["id", "purchase_id", "total_amount"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//for followup
exports.GetAllPurchaseOrderFolloup = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        mailsend_status: 1,
        [Op.and]: [
          {
            status: {
              [Op.gte]: 5
            }
          },
          {
            status: {
              [Op.ne]: 8
            }
          },
          {
            status: {
              [Op.ne]: 10
            }
          },
          {
            status: {
              [Op.ne]: 7
            }
          }
        ]
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
        {
          model: AdvancePayment,
          as: "advance",
        },
        {
          model: Followup,
          as: "followup",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//for recv listing
exports.GetAllPurchaseOrderRecv = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        mailsend_status: 1,
        [Op.and]: [
          {
            status: {
              [Op.gte]: 5
            }
          },
          {
            status: {
              [Op.ne]: 8
            }
          }, {
            status: {
              [Op.ne]: 10
            }
          }, {
            status: {
              [Op.ne]: 7
            }
          }
        ]
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
        {
          model: AdvancePayment,
          as: "advance",
        },
        {
          model: Followup,
          as: "followup",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
exports.pendingApproval = async (req, res) => {
  // return res.send('yesy');
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 3,
        is_parent: 1,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//final approval
exports.finalApproval = async (req, res) => {

  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 9,

      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//// insert remarks
exports.insertRemarks = async (req, res) => {
  try {
    // Create the new remarks
    const purchaseData = await Remarks.create({
      purchase_id: req.body.getPid,
      remarks: req.body.editorContent,
    });

    const purchaseId = req.body.getPid;
    sid = 4;
    // Validate purchaseId
    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({ error: "Invalid purchase ID" });
    }
    // Update the status of the purchase and its related purchases
    // let updateFields = {
    //   status: sid,
    // };

    // await Purchase.update(updateFields, { where: { id: purchaseId } });

    // if (sid == 4) {
    //   await Purchase.update(
    //     { status: sid },
    //     { where: { parent_recd_id: purchaseId } }
    //   );
    // }
    // Send a successful response
    res.status(201).json({
      success: true,
      data: purchaseData,
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

//find managment remarks
exports.getManagmentReview = async (req, res) => {
  //return res.send('sd');
  try {
    const purchaseData = await Remarks.findOne({
      where: {
        purchase_id: req.params.id,
      },
      include: {
        model: Purchase,
        as: "remark",
      },
      order: [["created_at", "DESC"]], // Adjust the field name as necessary
    });

    if (!purchaseData) {
      return res.status(404).json({ error: "Remarks not found" });
    }

    res.status(200).json(purchaseData);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

//insert advance payment
exports.insertAdvancePayment = async (req, res) => {
  try {
    // Create the new remarks
    const purchaseData = await AdvancePayment.create({
      amount: req.body.amount,
      purchase_id: req.body.purchase_id,
      user_id: req.user.id,
      company_id: req.user.company_id,
    });
    // Send a successful response
    res.status(201).json({
      success: true,
      data: purchaseData,
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// bill create
//create bill
exports.AddBill = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log("Starting transaction...");

    // Create Bill record
    const purchaseData = await Bill.create(
      {
        vendor_id: req.body.vendor_id,
        purchase_id: req.params.id,
        bill_number: req.body.bill_number,
        bill_reference: req.body.bill_reference,
        accounting_date: req.body.accounting_date,
        bill_date: new Date().toJSON().slice(0, 16),
        placeofsupply: req.body.placeofsupply,
        buyer: req.body.buyer,
        paymentreference: req.body.paymentreference,
        untaxed_amount: req.body.untaxed_amount,
        sgst: req.body.sgst,
        cgst: req.body.cgst,
        total_amount: req.body.total_amount,
        advancePayment: req.body.advancePayment,
        user_id: req.user.id,
        company_id: req.user.company_id,
      },
      { transaction }
    );

    console.log("Bill created:", purchaseData);

    // Create BillProduct records
    if (req.body.products && req.body.products.length > 0) {
      const productPromises = req.body.products.map(async (product) => {
        console.log("Creating product:", product);
        await BillProduct.create(
          {
            bill_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: parseFloat(product.unit_price),
            tax: product.tax,
            taxExcl: parseFloat(product.taxExcl),
            taxIncl: parseFloat(product.taxIncl),
            vendor_id: product.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
            received: product.received,
          },
          { transaction }
        );
        console.log("Product created:", product);
      });

      await Promise.all(productPromises);
      console.log("All products created");
    }

    await transaction.commit();
    console.log("Transaction committed");

    // Fetch the updated purchase data to respond with
    const updatedPurchase = await Bill.findByPk(purchaseData.id, {
      include: [{ model: BillProduct, as: "products" }],
    });

    await Purchase.update(
      { status: 6 },
      { where: { id: req.params.id } }
    );
    res.status(200).json(updatedPurchase);

  } catch (error) {
    console.error("Transaction rolled back due to error:", error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({
      error: "An error occurred while creating the purchase and products",
      details: error.message,
    });
  }
};



exports.getBill = async (req, res) => {
  const { id } = req.params;

  try {
    const purchaseData = await Bill.findOne({
      where: {
        purchase_id: id,
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: { [Op.ne]: 0 },
      },
      include: [
        {
          model: BillProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Payment, as: "allBill" },
        { model: Vendor, as: "vendorname" },
      ],

    });

    if (!purchaseData) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(purchaseData);
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({ error: "An error occurred while fetching the purchase data", details: error.message });
  }
};

//bill
exports.PaymentRecords = async (req, res) => {

  try {
    // Create the new remarks
    const paymentdata = await Payment.create({
      purchase_id: req.params.id,
      journal: req.body.journal,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      //paymentDate: req.body.paymentDate,
      recipientBankAccount: req.body.recipientBankAccount,
      memo: req.body.memo,
      bill_id: req.body.bill_id,
      user_id: req.user.id,
      company_id: req.user.company_id,
    });
    // Send a successful response
    res.status(200).json({
      success: true,
      data: paymentdata,

    });
    await Purchase.update(
      { status: 7 },
      { where: { id: req.params.id } }
    );
    await Bill.update(
      { status: 3 },
      { where: { purchase_id: req.params.id } }
    );

  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

//admin status change
exports.StatusUpdateFromAdmin = async (req, res) => {
  const { id, sid } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const purchaseId = id;
    console.log(purchaseId);

    // Validate purchaseId
    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({ error: "Invalid purchase ID" });
    }

    // Update the status of the purchase and its related purchases
    let updateFields = {
      status: sid,
    };



    await Purchase.update(updateFields, {
      where: { id: purchaseId },
      transaction,
    });


    //  sendMail('sumit.econstra@gmail.com','New Purchase Request for Approval','New Purchase Request for Approval');
    //  MaytapiWhatsappNotification("919163220851","New Purchase Request for Approval");
    await transaction.commit();
    //send confirmation messages

    return res.status(200).json({ message: "Records Updated" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    return res.status(500).json({
      error:
        "An error occurred while marking the purchase and related purchases as deleted",
    });
  }
};





exports.generatePDFForvendor = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await Purchase.findOne({
      where: { id },
      include: [
        {
          model: PurchaseProduct,
          as: 'products',
          include: [{ model: Product, as: 'ProductsItem' }],
        },
        { model: Vendor, as: 'vendor' },
        { model: AdvancePayment, as: 'advance' },
      ],
    });

    if (!response) return res.status(404).send('No data found');

    const fetchSettings = await GeneralSettings.findOne({
      where: {
        company_id: req.user.company_id,
      }
    });

    if (!fetchSettings) return res.status(404).send('Settings not found');

    const templateName = fetchSettings.template;
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);

    let template;
    try {
      template = fs.readFileSync(templatePath, 'utf8');
    } catch (err) {
      console.error('Error reading template:', err);
      return res.status(500).send('Template not found');
    }

    const compileTemplate = handlebars.compile(template);
    const advanceAmount = response.advance?.amount ? parseFloat(response.advance.amount) : 0;

    const data = {
      products: response.products.map(product => ({
        description: product.ProductsItem.product_name,
        tax: product.tax,
        dateReq: new Date(response.expected_arrival).toLocaleString(),
        qty: product.qty,
        unitPrice: parseFloat(product.unit_price).toFixed(2),
        amount: parseFloat(product.taxExcl).toFixed(2),
      })),
      vendor: {
        vendorName: response.vendor.vendor_name,
        address: response.vendor.address,
        city: response.vendor.city,
        state: response.vendor.state,
        country: response.vendor.country,
        zip: response.vendor.zip,
        phone: response.vendor.phone,
        email: response.vendor.email,
        website: response.vendor.website,
        gstin: response.vendor.gstin,
      },
      otherInfo: {
        refnumber: response.reference_number,
        UntaxedAmount: parseFloat(response.untaxed_amount).toFixed(2),
        total_amount: parseFloat(response.total_amount - advanceAmount).toFixed(2),
        totalAmountInWords: numberToWords.toWords(parseFloat(response.total_amount - advanceAmount)),
        advancepayment: advanceAmount.toFixed(2),
        buyer: response.buyer,
        dateline: new Date(response.order_dateline).toLocaleString(),
        today: new Date().toLocaleString(),
        companyAddress: fetchSettings.companyAddress,
        deliveryAddress: fetchSettings.deliveryAddress,
      }
    };

    const html = compileTemplate(data);

    const pdfDirectory = path.join(__dirname, '../pdf');
    if (!fs.existsSync(pdfDirectory)) fs.mkdirSync(pdfDirectory, { recursive: true });

    const outputPath = path.join(pdfDirectory, `purchase_order_${response.reference_number}.pdf`);

    // ✅ Create the PDF with html-pdf-node
    const file = { content: html };
    const options = {
      format: 'A4',
      path: outputPath,
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    };

    await htmlPdf.generatePdf(file, options); // Generates and writes to file

    // ✅ Send the file for download
    return res.download(outputPath, (downloadErr) => {
      if (downloadErr) {
        console.error('Error downloading file:', downloadErr);
        return res.status(500).send('Error downloading PDF');
      }
      // Optional: delete file after download
      // fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.generatePDF = async (id) => {
  try {
    const response = await Purchase.findOne({
      where: { id },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Vendor, as: "vendor" },
        { model: AdvancePayment, as: "advance" },
      ],
    });

    if (!response) throw new Error("No purchase data found");

    const templatePath = path.join(__dirname, '../templates/purchaseOrderTemplate.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const compileTemplate = handlebars.compile(template);

    const advanceAmount = response.advance?.amount ? parseFloat(response.advance.amount) : 0;

    const data = {
      products: response.products.map(product => ({
        description: product.ProductsItem.product_name,
        tax: product.tax,
        dateReq: new Date(response.expected_arrival).toLocaleString(),
        qty: product.qty,
        unitPrice: parseFloat(product.unit_price).toFixed(2),
        amount: parseFloat(product.taxExcl).toFixed(2),
      })),
      vendor: {
        vendorName: response.vendor.vendor_name,
        address: response.vendor.address,
        city: response.vendor.city,
        state: response.vendor.state,
        country: response.vendor.country,
        zip: response.vendor.zip,
        phone: response.vendor.phone,
        email: response.vendor.email,
        website: response.vendor.website,
        gstin: response.vendor.gstin,
        logofile: response.vendor.attachment_file
          ? `http://localhost:5000/uploads/${response.vendor.attachment_file}`
          : 'http://localhost:5000/uploads/no-image.svg',
      },
      otherInfo: {
        refnumber: response.reference_number,
        UntaxedAmount: parseFloat(response.untaxed_amount).toFixed(2),
        total_amount: parseFloat(response.total_amount - advanceAmount).toFixed(2),
        totalAmountInWords: numberToWords.toWords(parseFloat(response.total_amount - advanceAmount)),
        advancepayment: advanceAmount,
        buyer: response.buyer,
        dateline: new Date(response.order_dateline).toLocaleString(),
        today: new Date().toLocaleString(),
      }
    };

    const html = compileTemplate(data);
    const filePath = path.join(__dirname, `../pdf/purchase_order_${response.reference_number}.pdf`);

    // Prepare document for html-pdf-node
    const file = { content: html };

    const options = {
      format: 'A4',
      path: filePath,
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    };

    // Generate PDF
    await htmlPdf.generatePdf(file, options);

    return filePath;

  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};
exports.sendEmail = async (pdfPath, recipientEmail, jsonData) => {
  try {
    // Load email template
    const templatePath = path.join(__dirname, '../templates', 'emailTemplate.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const compileTemplate = handlebars.compile(template);

    // Prepare data for the template
    const advanceAmount = jsonData.advance && jsonData.advance.amount != null ? parseFloat(jsonData.advance.amount) : 0;
    const emailData = {
      vendorName: jsonData.vendor.vendor_name,
      referenceNumber: jsonData.reference_number,
      buyer: jsonData.buyer,
      totalAmount: parseFloat(jsonData.total_amount - advanceAmount).toFixed(2),
      expectedArrival: new Date(jsonData.expected_arrival).toLocaleString(),
    };

    const emailContent = compileTemplate(emailData);

    // Configure new SMTP transporter using Mailtrap
    const transporter = nodemailer.createTransport({
      host: "bulk.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: "api",
        pass: "da057933578f3a6ff62a852dcc135b5d"
      }
    });

    // Randomly pick a "from" address
    const fromAddresses = [
      'ERP-System@growthh.com',
      'no-reply@growthh.com',
      'growthh-ERP@growthh.com',
      'Software@growthh.com'
    ];
    const from = fromAddresses[Math.floor(Math.random() * fromAddresses.length)];

    const subject = `${jsonData.vendor.vendor_name} Order (Ref ${jsonData.reference_number})`;

    const mailOptions = {
      from,
      to: recipientEmail,
      subject,
      html: emailContent,
      attachments: [
        {
          filename: 'Purchase_Order.pdf',
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return "success";
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

exports.SendMailByPO = async (req, res) => {
  try {
    const data = req.body;
    const pdfPath = await exports.generatePDF(req.params.id, data.val);
    const response = await Purchase.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Vendor, as: "vendor" },
        { model: AdvancePayment, as: "advance" },
      ],
    });

     await exports.sendEmail(pdfPath, response.vendor.email, response);

    const advanceAmount = response.advance && response.advance.amount != null ? response.advance.amount : '0.00';
    const remainingAmount = parseFloat(response.total_amount) - parseFloat(advanceAmount);
    const formattedAmount = remainingAmount.toFixed(2);

    // const whatsappMessageContent = `Dear ${response.vendor.vendor_name},\n\nYour purchase order ${response.reference_number} amounting to ₹ ${formattedAmount} from ${response.buyer}. The receipt is expected on ${new Date(response.expected_arrival).toLocaleString()}. For more details, please check your email.`;

    // MaytapiWhatsappNotification('91' + response.vendor.mobile, whatsappMessageContent);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error sending email');
  }
};


exports.SendMailUpdate = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid purchase ID" });
  }
  try {
    // Update the status of the purchase
    await Purchase.update(
      { mailsend_status: 1 },
      { where: { id: req.params.id } }
    );

    return res.status(200).json({ message: "Records Updated" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error.message);
    return res.status(500).json({
      error: "An error occurred while updating the purchase record",
    });
  }
};



exports.insertfollowup = async (req, res) => {
  try {
    // Validate the input
    if (!req.body.getPid || !req.body.editorContent) {
      return res.status(400).json({
        success: false,
        error: "purchase_id and content are required",
      });
    }

    // Create the new remarks
    const purchaseData = await Followup.create({
      purchase_id: req.body.getPid,
      content: req.body.editorContent,
    });

    // Send a successful response
    res.status(200).json({
      success: true,
      data: purchaseData,
    });
  } catch (err) {
    // Handle any errors
    console.error("Error inserting follow-up:", err); // Log the error for debugging
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// recv order
exports.AddRecv = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log("Starting transaction...");

    let totalPurchaseAmount = 0;
    let untaxedAmount = 0;
    let sgstRate = 0;
    let cgstRate = 0;

    const products = req.body.products || [];

    if (products.length > 0) {
      products.forEach(product => {
        const received = parseFloat(product.received);
        const unit_price = parseFloat(product.unit_price);
        const taxRate = parseFloat(product.tax);

        const productUntaxedAmount = received * unit_price;
        const productTotalAmountp = (productUntaxedAmount * taxRate) / 100;
        const productTotalAmount = productUntaxedAmount + productTotalAmountp;

        totalPurchaseAmount += productTotalAmount;
        untaxedAmount += productUntaxedAmount;

        sgstRate = taxRate / 100;
        cgstRate = taxRate / 100;
      });
    }

    const sgst = untaxedAmount * sgstRate / 2;
    const cgst = untaxedAmount * cgstRate / 2;

    const purchaseData = await Recv.create(
      {
        vendor_id: req.body.vendor_id,
        purchase_id: req.params.id,
        bill_number: req.body.bill_number,
        bill_reference: req.body.bill_reference,
        bill_date: new Date().toJSON().slice(0, 16),
        placeofsupply: req.body.placeofsupply,
        buyer: req.body.buyer,
        untaxed_amount: untaxedAmount,
        sgst: sgst,
        cgst: cgst,
        total_amount: totalPurchaseAmount,
        user_id: req.user.id,
        company_id: req.user.company_id,
      },
      { transaction }
    );

    console.log("Recv created:", purchaseData);

    if (products.length > 0) {
      const productPromises = products.map(async (product) => {
        const received = parseFloat(product.received);
        const unit_price = parseFloat(product.unit_price);
        const taxRate = parseFloat(product.tax);

        const totalAmount = received * unit_price;
        const taxExcl = totalAmount;
        const taxInclp = totalAmount * (taxRate) / 100;
        const taxIncl = totalAmount + taxInclp;

        await RecvProduct.create(
          {
            bill_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: unit_price,
            tax: taxRate,
            taxExcl: taxExcl,
            taxIncl: taxIncl,
            vendor_id: product.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
            received: received,
            rejected: product.rejected,
            purchase_id: req.params.id,
          },
          { transaction }
        );

        // Insert into stock only if received > 0
        if (received > 0) {
          const productData = await Product.findOne({
            where: { id: product.product_id },
          });

          const defaultStore = await WarehouseModel.findOne({
            where: {
              company_id: req.user.company_id,
              is_default: 1,
            },
          });

          if (!defaultStore) throw new Error("Default store not found");

          const stockIn = await TrackProductStock.sum("quantity_changed", {
            where: {
              product_id: product.product_id,
              company_id: req.user.company_id,
              status_in_out: 1,
            },
          });

          const stockOut = await TrackProductStock.sum("quantity_changed", {
            where: {
              product_id: product.product_id,
              company_id: req.user.company_id,
              status_in_out: 0,
            },
          });

          const currentFinalQty = (stockIn || 0) - (stockOut || 0) + received;

          const referenceNumber = "INV" + Math.floor(1000000 + Math.random() * 9000000);
          const barcodeNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

          await TrackProductStock.create(
            {
              product_id: product.product_id,
              store_id: defaultStore.id,
              item_name: productData?.product_name || "",
              default_price: taxExcl || 0,
              quantity_changed: received,
              final_quantity: currentFinalQty,
              comment: `${req.body.bill_number} Stock added from purchase entry`,
              item_unit: productData?.unit || "",
              adjustmentType: `${req.body.bill_number} Stock added from purchase entry`,
              status_in_out: 1,
              reference_number: referenceNumber,
              barcode_number: barcodeNumber,
              company_id: req.user.company_id,
              user_id: req.user.id,
            },
            { transaction }
          );
        }
      });

      await Promise.all(productPromises);
      console.log("All products and stock (if received) created");
    }

    await transaction.commit();
    console.log("Transaction committed");

    const updatedPurchase = await Recv.findByPk(purchaseData.id, {
      include: [{ model: RecvProduct, as: "recvPro" }],
    });

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("Transaction rolled back due to error:", error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({
      error: "An error occurred while creating the receive and products",
      details: error.message,
    });
  }
};

// get recv
exports.getRecv = async (req, res) => {
  const { id } = req.params;

  try {
    const purchaseData = await Recv.findAll({
      where: {
        purchase_id: id,
        company_id: req.user.company_id,

        status: { [Op.ne]: 0 },
      },
      include: [
        {
          model: RecvProduct,
          as: "recvPro",
          include: [{ model: Product, as: "ProductsItem" }],
        },

        { model: Vendor, as: "vendorname" },
      ],

    });

    if (!purchaseData) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(purchaseData);
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({ error: "An error occurred while fetching the purchase data", details: error.message });
  }
};


//get total reject count
exports.GetAllPurchaseRejectcount = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 8 },
              ]
            }
          ]
        }
      }

    };


    // Get the count of total records
    const totalCount = await Purchase.count(queryConditions);

    // Fetch the products data
    const products = await Purchase.findAll(queryConditions);

    console.log('Products fetched:', products);

    // Respond with the products and total count
    res.status(200).json({
      totalCount,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

// total done
exports.GetAllPurchasedonecount = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 7 }],
            },
          ],
        },
      },
      include: [
        {
          association: "products", // alias defined in model: Purchase.hasMany(PurchaseProduct, { as: "products" })
          include: [
            {
              association: "ProductsItem", // alias defined in model: PurchaseProduct.belongsTo(Product, { as: "ProductsItem" })
            },
          ],
        },
      ],
    };

    // Get the count of total records
    const totalCountdone = await Purchase.count({ where: queryConditions.where });

    // Fetch the purchase records with product and product details
    const products = await Purchase.findAll(queryConditions);

    // Respond with the products and total count
    res.status(200).json({
      totalCountdone,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

//total rfq
//get total reject count
exports.GetAllPurchaseRrfq = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 2 },
              ]
            }
          ]
        }
      }

    };


    // Get the count of total records
    const totalCountrfq = await Purchase.count(queryConditions);


    // Respond with the products and total count
    res.status(200).json({
      totalCountrfq
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

//approved
exports.GetAllPurchaseapp = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [
                { [Op.eq]: 4 },
              ]
            }
          ]
        }
      }

    };
    // Get the count of total records
    const totalCountapp = await Purchase.count(queryConditions);


    // Respond with the products and total count
    res.status(200).json({
      totalCountapp
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

// order confirm
exports.GetAllPurchasOconfir = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: 5
      }

    };
    // Get the count of total records
    const totalCountocon = await Purchase.count(queryConditions);
    // Respond with the products and total count
    res.status(200).json({
      totalCountocon
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};
// Bill Created
exports.GetAllBillcreated = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: 6
      }

    };
    // Get the count of total records
    const totalCountbill = await Purchase.count(queryConditions);
    // Respond with the products and total count
    res.status(200).json({
      totalCountbill
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};

// get done count vendorwise
exports.GetDoneVendorwise = async (req, res) => {
  try {
    // Define the query conditions for the initial count
    const queryConditions = {
      where: {
        company_id: req.user.company_id,

        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
          ]
        }

      }
    };

    // Get the count of total records
    const totalCountapp = await Purchase.count(queryConditions);

    // Get the count of records grouped by vendor_id where status is 7
    const vendorStatus7Count = await Purchase.findAll({
      where: {
        status: 7
      },
      include: [
        { model: Vendor, as: "vendor" },
      ],
      attributes: ['vendor_id', [Sequelize.fn('COUNT', Sequelize.col('vendor_id')), 'count']],
      group: ['vendor_id']
    });

    // Respond with the products, total count, and vendor status 7 count
    res.status(200).json({
      vendorStatus7Count
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching the products" });
  }
};
//get total 
exports.GetVendorPerformance = async (req, res) => {
  try {
    const companyId = req.user?.company_id || 39;

    const results = await Purchase.findAll({
      where: {
        status: 7,
        company_id: companyId,
        order_dateline: { [Op.ne]: null },
        updated_at: { [Op.ne]: null }
      },
      attributes: [
        'vendor_id',
        [Sequelize.literal('AVG(DATEDIFF(`Purchase`.`updated_at`, `Purchase`.`order_dateline`))'), 'average_delay_days'],
        [Sequelize.fn('SUM', Sequelize.col('Purchase.total_amount')), 'total_purchase']
      ],
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendor_name']
        }
      ],
      group: [
        'vendor_id',
        'vendor.id'
      ],
      order: [[Sequelize.literal('average_delay_days'), 'DESC']]
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("🔥 Error in Sequelize vendor performance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPatmentData = async (req, res) => {

  try {
    const [results, metadata] = await sequelize.query(`SELECT 
    a.created_at,
    SUM(a.amount) + COALESCE(SUM(b.amount), 0) AS total_amount
FROM 
    payments AS a
LEFT JOIN 
    advance_payment AS b 
ON 
    a.purchase_id = b.purchase_id
WHERE 
    a.user_id = ${req.user.id} 
    AND a.company_id = ${req.user.company_id}
GROUP BY 
    a.created_at;`)
    const purchaseData = results;
    console.log(results, metadata);
    if (!purchaseData.length) { // Check if the array is empty

      return res.status(404).json({ error: "No purchase data found" });
    }

    res.status(200).json(purchaseData);
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({ error: "An error occurred while fetching the purchase data", details: error.message });
  }
};

exports.GetMonthlyRFQPurchaseReport = async (req, res) => {
  try {
    const companyId = req.user?.company_id || 39;

    // Raw query using Sequelize literal for month-year grouping
    // We will get two aggregates, one for RFQs, one for Purchases (status=7)
    // Since RFQ = all records grouped by created_at
    // Purchases = only status=7 grouped by updated_at

    const rfqData = await Purchase.findAll({
      where: { company_id: companyId },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'rfq_count'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'rfq_total_amount'],
      ],
      group: ['month'],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    const purchaseData = await Purchase.findAll({
      where: {
        company_id: companyId,
        status: 7,
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('updated_at'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'purchase_count'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'purchase_total_amount'],
      ],
      group: ['month'],
      order: [[Sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    // Merge rfqData and purchaseData by month
    const merged = {};

    rfqData.forEach(item => {
      merged[item.month] = {
        month: item.month,
        rfqCount: parseInt(item.rfq_count, 10),
        rfqTotalAmount: parseFloat(item.rfq_total_amount) || 0,
        purchaseCount: 0,
        purchaseTotalAmount: 0,
      };
    });

    purchaseData.forEach(item => {
      if (!merged[item.month]) {
        merged[item.month] = {
          month: item.month,
          rfqCount: 0,
          rfqTotalAmount: 0,
          purchaseCount: parseInt(item.purchase_count, 10),
          purchaseTotalAmount: parseFloat(item.purchase_total_amount) || 0,
        };
      } else {
        merged[item.month].purchaseCount = parseInt(item.purchase_count, 10);
        merged[item.month].purchaseTotalAmount = parseFloat(item.purchase_total_amount) || 0;
      }
    });

    // Convert merged object to array sorted by month
    const result = Object.values(merged).sort((a, b) => (a.month > b.month ? 1 : -1));

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("Error fetching monthly RFQ and purchase report:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPurchasesWithStatusNine = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [results] = await sequelize.query(`
      SELECT 
        p.id AS purchase_id,
        p.reference_number,
        p.order_dateline,
        p.expected_arrival,
        p.total_amount,
        p.untaxed_amount,
        p.buyer,
        p.source_document,
        p.payment_terms,
        p.created_at,
        p.updated_at,

        -- Vendor
        v.id AS vendor_id,
        v.vendor_name,
        v.address,
        v.email,
        v.phone,

        -- Product
        pp.id AS purchase_product_id,
        pp.qty,
        pp.unit_price,
        pp.tax,
        pp.taxIncl,
        pp.taxExcl,
        
        prod.id AS product_id,
        prod.product_name,
        prod.product_code,
        prod.product_price,
        prod.unit

      FROM purchase p

      LEFT JOIN purchase_product pp ON pp.purchase_id = p.id
      LEFT JOIN product prod ON prod.id = pp.product_id
      LEFT JOIN vendor v ON v.id = p.vendor_id

      WHERE p.status = 9
        AND p.company_id = :companyId
      ORDER BY p.created_at DESC
    `, {
      replacements: { companyId },
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Custom query error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};



exports.getPurchaseOrderSummary = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const results = await sequelize.query(`
      SELECT 
        p.id AS purchase_id,
        p.reference_number,
        p.order_dateline,
        p.expected_arrival,
        p.total_amount,
        p.untaxed_amount,
        p.buyer,
        p.source_document,
        p.payment_terms,
        p.status,
        p.created_at,
        p.updated_at,

        -- Vendor Details
        v.id AS vendor_id,
        v.vendor_name,
        v.email,
        v.phone,
        v.address,

        -- Product Details
        pp.id AS purchase_product_id,
        pp.product_id,
        pp.qty,
        pp.unit_price,
        pp.tax,
        pp.taxIncl,
        pp.taxExcl,
        pp.tax_amount,

        prod.product_name,
        prod.product_code,
        prod.unit,
        prod.product_price

      FROM purchase p
      LEFT JOIN vendor v ON v.id = p.vendor_id
      LEFT JOIN purchase_product pp ON pp.purchase_id = p.id
      LEFT JOIN product prod ON prod.id = pp.product_id

      WHERE p.company_id = :companyId
      ORDER BY p.created_at DESC
    `, {
      replacements: { companyId },
      type: QueryTypes.SELECT,
      nest: true,
      raw: true
    });

    console.log("Query returned rows:", results.length); // ✅ Debugging

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error in getPurchaseOrderSummary:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};



// exports.purchaseLedger = async (req, res) => {
//   const { vendor_id,  startDate, endDate } = req.body;

//   try {
//     let company_id = req.user.company_id;
//     // Build dynamic conditions
//     let conditions = `WHERE p.status >= 5 AND p.mailsend_status = 1`;
//     const replacements = {};

//     if (vendor_id) {
//       conditions += ` AND p.vendor_id = :vendor_id`;
//       replacements.vendor_id = vendor_id;
//     }

//     if (company_id) {
//       conditions += ` AND p.company_id = :company_id`;
//       replacements.company_id = company_id;
//     }

//     if (startDate && endDate) {
//       conditions += ` AND p.created_at BETWEEN :startDate AND :endDate`;
//       replacements.startDate = startDate;
//       replacements.endDate = endDate;
//     }

//     const query = `
//       SELECT 
//           v.vendor_name,
//           p.reference_number,
//           r.bill_number,
//           pr.product_name,
//           DATE(r.created_at) AS recv_date,
//           rp.product_id,
//           rp.qty AS ordered,
//           rp.received,
//           -- Remaining before this bill
//           (rp.qty - SUM(rp.received) OVER (
//               PARTITION BY p.reference_number, rp.product_id
//               ORDER BY r.created_at
//               ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
//           )) AS remaining_before,
//           -- Remaining after this bill
//           (rp.qty - SUM(rp.received) OVER (
//               PARTITION BY p.reference_number, rp.product_id
//               ORDER BY r.created_at
//               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
//           )) AS remaining_after,
//           p.company_id
//       FROM recvproduct rp
//       JOIN recv r ON r.id = rp.bill_id
//       JOIN purchase p ON p.id = rp.purchase_id
//       JOIN vendor v ON v.id = p.vendor_id
//       JOIN product pr ON pr.id = rp.product_id
//       ${conditions}
//       ORDER BY v.vendor_name, p.reference_number, rp.product_id, r.created_at
//     `;

//     const [results] = await sequelize.query(query, {
//       replacements,
//       type: sequelize.QueryTypes.SELECT,
//     });

//     res.status(200).json(results);
//   } catch (error) {
//     console.error("Error generating purchase ledger:", error);
//     res.status(500).json({ error: "Failed to generate purchase ledger" });
//   }
// };

exports.purchaseLedger = async (req, res) => {
  const { vendor_id, startDate, endDate } = req.body;

  try {
    const company_id = req.user?.company_id; // optional chaining, safer

    // Base conditions
    let conditions = `WHERE p.status >= 5 AND p.mailsend_status = 1`;
    const replacements = {};

    if (vendor_id) {
      conditions += ` AND p.vendor_id = :vendor_id`;
      replacements.vendor_id = vendor_id;
    }

    if (company_id) {
      conditions += ` AND p.company_id = :company_id`;
      replacements.company_id = company_id;
    }

    if (startDate && endDate) {
      conditions += ` AND DATE(p.created_at) BETWEEN :startDate AND :endDate`;
      replacements.startDate = startDate;
      replacements.endDate = endDate;

    }

    const query = `
      SELECT 
          v.vendor_name,
          p.reference_number,
          r.bill_number,
          pr.product_name,
          DATE(r.bill_date) AS recv_date,
          rp.product_id,
          rp.qty AS ordered,
          rp.received,
          -- Remaining before this bill
          (rp.qty - SUM(rp.received) OVER (
              PARTITION BY p.reference_number, rp.product_id
              ORDER BY r.created_at
              ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
          )) AS remaining_before,
          -- Remaining after this bill
          (rp.qty - SUM(rp.received) OVER (
              PARTITION BY p.reference_number, rp.product_id
              ORDER BY r.created_at
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          )) AS remaining_after,
          p.company_id
      FROM recvproduct rp
      JOIN recv r ON r.id = rp.bill_id
      JOIN purchase p ON p.id = rp.purchase_id
      JOIN vendor v ON v.id = p.vendor_id
      JOIN product pr ON pr.id = rp.product_id
      ${conditions}
      ORDER BY v.vendor_name, p.reference_number, rp.product_id, r.created_at
    `;

    // Note: Do NOT destructure the results here, sequelize returns array directly on SELECT
    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("Purchase Ledger results count:", results.length);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error generating purchase ledger:", error);
    res.status(500).json({ error: "Failed to generate purchase ledger" });
  }
};


