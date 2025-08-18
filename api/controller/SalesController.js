const { where, Sequelize, QueryTypes } = require("sequelize");
const { Op } = require("sequelize");
const User = require("../model/User");
const TrackProductStock = require("../model/TrackProductStock");
const Store = require("../model/WarehouseModel");

const {
  PurchaseProduct,
  Remarks,
  Followup,
  sequelize,
  AdvancePayment,
  Purchase,
  PurchaseRe,
  PurchaseProductRe,
} = require("../model/Sales");
const puppeteer = require("puppeteer");
const CompanyManagement = require("../model/CompanyManagement");

const wkhtmltopdf = require("wkhtmltopdf");

const fs = require("fs");
const path = require("path");
const generateUniqueReferenceNumber = require("../utils/generateReferenceNumber");

const numberToWords = require("number-to-words");
const handlebars = require("handlebars");
const Vendor = require("../model/Customer");
const Product = require("../model/Product");
const Bill = require("../model/Bill");
const BillProduct = require("../model/BillProduct");
const Payment = require("../model/RegisterPayment");
const Production = require("../model/Production");

const { required } = require("joi");

const {
  sendMail,
  GreenApiWhatsappNotification,
  MaytapiWhatsappNotification,
  MaytapiWhatsappNotificationmedia,
} = require("../utils/Helper");
const nodemailer = require("nodemailer");
// Adjust the path as necessary

const Recv = require("../model/Recv");
const RecvProduct = require("../model/RecvProduct");
const Customer = require("../model/Customer");
const { GeneralSettings } = require("../model/CompanyModel");
const { error, time } = require("console");
const MasteruomModel = require("../model/MasteruomModel");
const ProductCategories = require("../model/ProductCategory");
exports.AddPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const referenceNumber = await generateUniqueReferenceNumber();
    console.log("Creating Purchase...");
    const purchaseData = await Purchase.create(
      {
        reference_number: "S" + referenceNumber,
        customer_id: req.body.customer_id,
        customer_reference: req.body.customer_reference,
        expiration: req.body.expiration,
        dalivery_date: req.body.dalivery_date,
        buyer: req.body.buyer,
        source_document: req.body.source_document,
        payment_terms: req.body.payment_terms,
        total_amount: req.body.total_amount,
        untaxed_amount: req.body.untaxed_amount,
        is_parent: req.body.is_parent,
        is_parent_id: req.body.is_parent_id,
        user_id: req.user.id,
        company_id: req.user.company_id,
        mailsend_status: req.body.mailsend_status || "0",
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
            sales_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            taxExcl: product.taxExcl,
            taxIncl: product.taxIncl, // Store total including tax
            vendor_id: req.body.vendor_id,
            taxAmount: taxAmount,
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
          where: { sales_id: purchaseData.id },
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
        reference_number: "S" + referenceNumber,
        customer_id: req.body.customer_id,
        customer_reference: req.body.customer_reference,
        expiration: req.body.expiration,
        dalivery_date: req.body.dalivery_date,
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
        mailsend_status: req.body.mailsend_status || "0",
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
            sales_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            taxExcl: productTotal,
            taxIncl: totalWithTax,
            taxAmount: taxAmount,
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
          where: { sales_id: purchaseData.id },
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
      !req.body.customer_id ||
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

    console.log(`Updating Purchase details for id: ${id}...`);
    // Update Purchase details
    await Purchase.update(
      {
        customer_id: req.body.vendor_id,
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

    console.log(`Deleted existing PurchaseProducts for Purchase ID ${id}...`);
    // Delete existing PurchaseProducts for this Purchase
    await PurchaseProduct.destroy({
      where: { sales_id: id },
      transaction,
    });

    let totalPurchaseAmount = 0;

    // Create new PurchaseProducts based on updated data
    if (req.body.products && req.body.products.length > 0) {
      console.log("Creating Purchase Products...");
      const productPromises = req.body.products.map(async (product) => {
        // Calculate product total including tax
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;

        totalPurchaseAmount += totalWithTax;

        // Create PurchaseProduct record
        await PurchaseProduct.create(
          {
            sales_id: id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            taxExcl: productTotal,
            taxIncl: totalWithTax,
            taxAmount: taxAmount,
            customer_id: product.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
          },
          { transaction }
        );
      });

      await Promise.all(productPromises);
      console.log("All Purchase Products created.");
    }

    // Update the purchase record with total amount
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
    console.log(`Purchase with id ${id} updated successfully.`);

    // Fetch the updated purchase data to respond with
    const updatedPurchase = await Purchase.findByPk(id);

    if (!updatedPurchase) {
      return res.status(404).json({ error: "Purchase not found after update" });
    }

    // Return the updated purchase data including total amount to the client
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
exports.GetAllPurchaseOrderforFloormanagment = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        mailsend_status: { [Op.ne]: 1 }, // ✅ Add this condition
        status: {
          [Op.in]: [9],
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "customer",
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
exports.GetAllPurchase = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 }, // Exclude status = 0
            { [Op.ne]: 4 }, // Exclude status = 4
            {
              [Op.or]: [
                { [Op.lt]: 5 }, // Status is less than 5
                { [Op.eq]: 8 }, // OR status is equal to 8
              ],
            },
          ],
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("Products fetched:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

exports.GetAllSalesQuotetion = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.eq]: 2,
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("Products fetched:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

exports.GetAllSalesreject = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.eq]: 8,
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("Products fetched:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

exports.GetAllSalesReview = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.eq]: 3,
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("Products fetched:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

//show all reject
exports.GetAllPurchaseReject = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 8 }],
            },
          ],
        },
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "customer",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("Products fetched:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

exports.getPurchase = async (req, res) => {
  //return res.send('yesy');
  //   try {
  const purchaseData = await Purchase.findOne({
    where: {
      id: req.params.id,
      company_id: req.user.company_id,
      user_id: req.user.id,
    },
    include: [
      {
        model: PurchaseProduct,
        as: "products",
        include: [{ model: Product, as: "ProductsItem" }],
      },
      { model: Customer, as: "customer" },
      // { model: AdvancePayment, as: "advance" },
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

exports.getPurchaseaddi = async (req, res) => {
  const { id, venid } = req.params;

  //   try {
  const purchaseData = await Purchase.findAll({
    where: {
      parent_recd_id: id,
      is_parent_id: venid,
      company_id: req.user.company_id,
      user_id: req.user.id,
      status: { [Op.ne]: 0 },
    },
    include: [
      {
        model: PurchaseProduct,
        as: "products",
        include: [{ model: Product, as: "ProductsItem" }],
      },
      { model: Vendor, as: "customer" },
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
  try {
    const purchaseData = await Purchase.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { id: req.params.id },
              { parent_recd_id: req.params.id }
            ],
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
        { model: Vendor, as: "customer" },
        { model: Remarks, as: "remarkdata" },
      ],
    });

    if (!purchaseData || purchaseData.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Loop over all purchases and their products
    for (const purchase of purchaseData) {
      for (const product of purchase.products) {
        const product_id = product.product_id;
        const qty = product.quantity; // Assuming `quantity` field exists
        const company_id = req.user.company_id;

        const totalIn = await TrackProductStock.sum("quantity_changed", {
          where: {
            product_id,
            company_id,
            status_in_out: 1,
          },
        });

        const totalOut = await TrackProductStock.sum("quantity_changed", {
          where: {
            product_id,
            company_id,
            status_in_out: 0,
          },
        });

        const currentStock = (totalIn || 0) - (totalOut || 0);


        // Add stock data to each product
        product.setDataValue("totalIn", totalIn || 0);
        product.setDataValue("totalOut", totalOut || 0);
        product.setDataValue("currentStock", currentStock);

      }
    }

    return res.status(200).json(purchaseData);
  } catch (err) {
    console.error("Error fetching purchase comparison:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.StatusUpdate = async (req, res) => {
  const { id: purchaseId, sid: statusId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    console.log("Updating purchase ID:", purchaseId, "to status:", statusId);

    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({ error: "Invalid purchase ID" });
    }

    const parsedStatus = parseInt(statusId);

    const updateFields = {
      //status: parsedStatus === 10 || parsedStatus === 11 ? 9 : parsedStatus,
      status: parsedStatus,
    };

    if (parsedStatus === 10 || parsedStatus === 11) {
      updateFields.mailsend_status = 1;
    }
    // when floor manager direct dispatch
    // if (parsedStatus === 11) {
    //   // 1. Get Default Store
    //   const defaultStore = await Store.findOne({
    //     where: {
    //       company_id: req.user.company_id,
    //       is_default: 1,
    //     },
    //   });

    //   if (!defaultStore) {
    //     return res.status(400).json({ message: "Default store not found." });
    //   }

    //   const store_id = defaultStore.id;

    //   // 2. Get Sales Products with Product Details
    const updateFieldsPdata = {
      status: parsedStatus,
    };

    const purchaseProducts = await PurchaseProduct.findAll({
      where: {
        sales_id: purchaseId,
      },
      // include: [
      //   {
      //     model: Product,
      //     as: "product",
      //     attributes: ["product_name", "unit", "product_price"],
      //   },
      // ],
    });
    if (!purchaseProducts || purchaseProducts.length === 0) {
      return res.status(400).json({ message: "No products found for this purchase." });
    } else {
      await PurchaseProduct.update(updateFieldsPdata, {
        where: { sales_id: purchaseId },
        transaction,
      });
    }
    //   const generateInvoiceNumber = () => {
    //     const datePart = new Date()
    //       .toISOString()
    //       .slice(0, 10)
    //       .replace(/-/g, "");
    //     const randomPart = Math.floor(1000 + Math.random() * 9000);
    //     return `INV${datePart}${randomPart}`;
    //   };

    //   const invoiceNumber = generateInvoiceNumber();

    //   await PurchaseProduct.update(
    //     {
    //       production_status: 5,
    //       is_dispatched: true,
    //       is_invoice: true,
    //       invoice_number: invoiceNumber,
    //       invoice_date: new Date(),
    //     },
    //     {
    //       where: {
    //         sales_id: purchaseId,
    //       },
    //     }
    //   );

    //   // 4. Update TrackProductStock for each item
    //   for (const item of purchaseProducts) {
    //     const {
    //       product_id,
    //       qty,
    //       product: { product_name, unit, product_price },
    //     } = item;

    //     if (!qty) {
    //       return res.status(400).json({
    //         message: `Product quantity is missing for ${product_name}`,
    //       });
    //     }

    //     const reference_number = generateReferenceNumber();
    //     const barcode_number = generateBarcodeNumber();

    // const totalIn = await TrackProductStock.sum("quantity_changed", {
    //   where: {
    //     product_id,
    //     company_id: req.user.company_id,
    //     status_in_out: 1,
    //   },
    // });

    // const totalOut = await TrackProductStock.sum("quantity_changed", {
    //   where: {
    //     product_id,
    //     company_id: req.user.company_id,
    //     status_in_out: 0,
    //   },
    // });

    // const currentStock = (totalIn || 0) - (totalOut || 0);
    // const final_quantity = currentStock - qty;

    //     if (final_quantity < 0) {
    //       return res.status(400).json({
    //         message: `Insufficient stock for ${product_name}`,
    //       });
    //     }

    //     await TrackProductStock.create({
    //       product_id,
    //       item_name: product_name,
    //       default_price: product_price,
    //       item_unit: unit,
    //       store_id,
    //       quantity_changed: qty,
    //       status_in_out: 0, // OUT
    //       reference_number,
    //       barcode_number,
    //       user_id: req.user.id,
    //       company_id: req.user.company_id,
    //       adjustmentType: "Delivery to User",
    //       final_quantity,
    //     });
    //   }
    // }

    // end the update

    await Purchase.update(updateFields, {
      where: { id: purchaseId },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({ message: "Records Updated Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    return res.status(500).json({
      error: "An error occurred while updating the purchase status",
    });
  }
};

// Get all products for a specific purchase
exports.StatusUpdateProductwise = async (req, res) => {
  const { pid: salesid, sid: statusId, spid: spid } = req.params;
  const transaction = await sequelize.transaction();

  try {
    console.log("Updating purchase ID:", salesid, "to status:", statusId, "for sales ID:", spid);

    if (!spid || isNaN(spid)) {
      return res.status(400).json({ error: "Invalid purchase ID" });
    }

    const parsedStatus = parseInt(statusId);

    const updateFields = {
      //status: parsedStatus === 10 || parsedStatus === 11 ? 9 : parsedStatus,
      status: parsedStatus,
    };

    if (parsedStatus === 10 || parsedStatus === 11) {
      updateFields.mailsend_status = 1;
    }


    //   // 2. Get Sales Products with Product Details
    const updateFieldsPdata = {
      status: parsedStatus,
    };

    const purchaseProducts = await PurchaseProduct.findAll({
      where: {
        sales_id: salesid,
        id: spid,
      },

    });
    if (!purchaseProducts || purchaseProducts.length === 0) {
      return res.status(400).json({ message: "No products found for this purchase." });
    } else {
      await PurchaseProduct.update(updateFieldsPdata, {
        where: { sales_id: salesid, id: spid },
        transaction,
      });
    }


    await Purchase.update(updateFields, {
      where: { id: salesid },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({ message: "Records Updated Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    return res.status(500).json({
      error: "An error occurred while updating the purchase status",
    });
  }
};

//get products
exports.GetProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, id: user_id } = req.user;

    // Fetch purchase data
    const purchaseData = await PurchaseProduct.findAll({
      where: {
        sales_id: id,
        company_id: company_id,
        user_id: user_id,
      },
      include: [{ model: Product, as: "ProductsItem" }],
    });

    // Check if purchaseData is empty
    if (purchaseData.length === 0) {
      return res.status(404).json({ error: "No purchases found" });
    }

    res.status(200).json(purchaseData);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the purchase" });
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
        { where: { sales_id: purchaseData.id }, transaction }
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
        //user_id: req.user.id,
        [Op.and]: [
          {
            status: {
              [Op.eq]: 4,
            },
          },
        ],
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "customer",
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

//done list
exports.GetAllPurchaseOrderDone = async (req, res) => {
  try {
    const products = await Purchase.findAll({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 6,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        {
          model: Vendor,
          as: "customer",
        },
        {
          model: PurchaseRe,
          as: "productsreprodut",
          include: [{ model: PurchaseProductRe, as: "productsre" }],
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
exports.GetAllPurchaseOrderCompare = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Purchase.findOne({
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        id: id,
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        {
          model: Vendor,
          as: "customer",
        },
        {
          model: PurchaseRe,
          as: "productsreprodut",
          include: [
            {
              model: PurchaseProductRe,
              as: "productsre",
              include: [{ model: Product, as: "ProductsItemre" }],
            },
          ],
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
        [Op.and]: [
          {
            status: {
              [Op.eq]: 5,
            },
          },
        ],
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "customer",
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
        [Op.and]: [
          {
            status: {
              [Op.gte]: 5,
            },
          },
          {
            status: {
              [Op.ne]: 8,
            },
          },
          {
            status: {
              [Op.ne]: 10,
            },
          },
          {
            status: {
              [Op.ne]: 7,
            },
          },
        ],
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
      },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
        },
        {
          model: Vendor,
          as: "customer",
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

//// insert remarks
exports.insertRemarks = async (req, res) => {
  try {
    // Create the new remarks
    const purchaseData = await Remarks.create({
      sales_id: req.body.getPid,
      remarks: req.body.editorContent,
      next_followup_date: req.body.next_followup_date,
    });

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
        sales_id: req.params.id,
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
      sales_id: req.body.purchase_id,
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

//bill
exports.PaymentRecords = async (req, res) => {
  try {
    // Create the new remarks
    const paymentdata = await Payment.create({
      sales_id: req.params.id,
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
    await Purchase.update({ status: 7 }, { where: { id: req.params.id } });
    await Bill.update({ status: 3 }, { where: { sales_id: req.params.id } });
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
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Vendor, as: "customer" },
        { model: AdvancePayment, as: "advance" },
      ],
    });

    if (!response) return res.status(404).send("No data found");

    const fetchSettings = await GeneralSettings.findOne({
      where: { company_id: req.user.company_id },
    });
    const Companydetails = await CompanyManagement.findOne({
      where: { id: req.user.company_id },
    });
    if (!fetchSettings) return res.status(404).send("Settings not found");

    const templatePath = path.join(__dirname, "../templates", `${fetchSettings.template}.html`);
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateHtml);

    const advanceAmount = response.advance?.amount || 0;

    const data = {
      products: response.products.map(product => ({
        description: product.ProductsItem?.product_name || "",
        tax: product.tax,
        dateReq: new Date(response.expected_arrival).toLocaleDateString(),
        qty: product.qty,
        unitPrice: parseFloat(product.unit_price).toFixed(2),
        amount: parseFloat(product.taxExcl).toFixed(2),
      })),
      vendor: {
        vendorName: response.customer.name,
        address: response.customer.address,
        city: response.customer.city,
        state: response.customer.state,
        country: response.customer.country,
        zip: response.customer.zip,
        phone: response.customer.phone,
        email: response.customer.email,
        website: response.customer.website,
      },
      otherInfo: {
        refnumber: response.reference_number,
        UntaxedAmount: parseFloat(response.untaxed_amount).toFixed(2),
        total_amount: parseFloat(response.total_amount - advanceAmount).toFixed(2),
        advancepayment: advanceAmount,
        buyer: response.buyer,
        dateline: new Date(response.expiration).toLocaleDateString(),
        today: new Date().toLocaleDateString(),

        deliveryAddress: fetchSettings.deliveryAddress,
        signature: fetchSettings.signature,
        comp: Companydetails.company_name,
        compadd: Companydetails.address,
        gstn: Companydetails.gst,
        contact: Companydetails.contact_phone,
      }
    };

    const html = template(data);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // ✅ Save PDF file to disk
    const fileName = `purchase_order_${response.reference_number}.pdf`;
    const filePath = path.join(__dirname, "../pdf", fileName);

    // Ensure directory exists
    const pdfDir = path.dirname(filePath);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBuffer); // Save file

    // ✅ Continue with original behavior — send PDF to browser
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).send("Failed to generate PDF");
  }
};

exports.generatePDF = async (id, cid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await Purchase.findOne({
        where: { id },
        include: [
          {
            model: PurchaseProduct,
            as: "products",
            include: [{ model: Product, as: "ProductsItem" }],
          },
          { model: Vendor, as: "customer" },
          { model: AdvancePayment, as: "advance" },
        ],
      });

      // Fetch settings
      const fetchSettings = await GeneralSettings.findOne({
        where: {
          company_id: cid,
        },
      });
      const jsonData = response;
      if (jsonData) {
        const templatePath = path.join(
          __dirname,
          "../templates",
          "salesOrderTemplate.html"
        );
        const template = fs.readFileSync(templatePath, "utf8");
        const compileTemplate = handlebars.compile(template);
        const advanceAmount =
          jsonData.advance && jsonData.advance.amount != null
            ? parseFloat(jsonData.advance.amount)
            : 0;

        // Prepare data for the template
        const data = {
          products: jsonData.products.map((product) => ({
            description: product.ProductsItem.product_name,
            tax: product.tax,
            dateReq: new Date(jsonData.expected_arrival).toLocaleString(),
            qty: product.qty,
            unitPrice:
              fetchSettings.symbol +
              " " +
              parseFloat(product.unit_price).toFixed(2),
            amount:
              fetchSettings.symbol +
              " " +
              parseFloat(product.taxExcl).toFixed(2),
          })),
          vendor: {
            vendorName: jsonData.customer.name,
            address: jsonData.customer.address,
            city: jsonData.customer.city,
            state: jsonData.customer.state,
            country: jsonData.customer.country,
            zip: jsonData.customer.zip,
            phone: jsonData.customer.phone,
            email: jsonData.customer.email,
            website: jsonData.customer.website,
            logofile:
              jsonData.customer.attachment_file != null
                ? "http://localhost:5000/uploads/" +
                jsonData.vendor.attachment_file
                : "http://localhost:5000/uploads/no-image.svg",
          },
          otherInfo: {
            refnumber: jsonData.reference_number,
            UntaxedAmount:
              fetchSettings.symbol +
              " " +
              parseFloat(jsonData.untaxed_amount).toFixed(2),
            total_amount:
              fetchSettings.symbol +
              " " +
              parseFloat(jsonData.total_amount - advanceAmount).toFixed(2),
            totalAmountInWords: numberToWords.toWords(
              parseFloat(jsonData.total_amount - advanceAmount)
            ),
            advancepayment: fetchSettings.symbol + " " + advanceAmount,
            buyer: jsonData.buyer,
            dateline: new Date(jsonData.expiration).toLocaleString(),
            signature: fetchSettings.signature,
          },
        };

        const html = compileTemplate(data);

        // Use wkhtmltopdf to create PDF
        const pdfPath = path.join(
          __dirname,
          `../pdf/purchase_order_${jsonData.reference_number}.pdf`
        );

        wkhtmltopdf(html, { output: pdfPath, pageSize: "A4" }, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(pdfPath);
          }
        });
      } else {
        reject(new Error("No data found"));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      reject(error);
    }
  });
};
exports.sendEmail = async (pdfPath, recipientEmail, jsonData) => {
  try {
    // Load email template
    const templatePath = path.join(
      __dirname,
      "../templates",
      "emailTemplate.html"
    );
    const template = fs.readFileSync(templatePath, "utf8");
    const compileTemplate = handlebars.compile(template);

    // Prepare data for the template
    const advanceAmount =
      jsonData.advance && jsonData.advance.amount != null
        ? parseFloat(jsonData.advance.amount)
        : 0;
    const emailData = {
      vendorName: jsonData.customer.name,
      referenceNumber: jsonData.reference_number,
      buyer: jsonData.buyer,
      totalAmount: parseFloat(jsonData.total_amount - advanceAmount).toFixed(2),
      expectedArrival: new Date(jsonData.expected_arrival).toLocaleString(),
    };

    const emailContent = compileTemplate(emailData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "growthh.in@gmail.com",
        pass: "ropdipfufoimwdka",
      },
    });

    const subject = `${jsonData.customer.name} Order (Ref ${jsonData.reference_number})`;

    const mailOptions = {
      from: "notifications@growthh.in",
      to: recipientEmail,
      subject: subject,
      html: emailContent,
      attachments: [
        {
          filename: "Purchase_Order.pdf",
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

exports.SendMailByPO = async (req, res) => {
  try {
    const data = req.body;
    const pdfPath = await exports.generatePDF(
      req.params.id,
      req.user.company_id
    );
    const response = await Purchase.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: PurchaseProduct,
          as: "products",
          include: [{ model: Product, as: "ProductsItem" }],
        },
        { model: Vendor, as: "customer" },
        { model: AdvancePayment, as: "advance" },
      ],
    });

    await exports.sendEmail(pdfPath, response.customer.email, response);

    const advanceAmount =
      response.advance && response.advance.amount != null
        ? response.advance.amount
        : "0.00";
    const remainingAmount =
      parseFloat(response.total_amount) - parseFloat(advanceAmount);
    const formattedAmount = remainingAmount.toFixed(2);

    const whatsappMessageContent = `Dear ${response.customer.name
      },\n\nYour sales order ${response.reference_number
      } amounting to  ${formattedAmount} from ${response.buyer
      }. The receipt is expected on ${new Date(
        response.expected_arrival
      ).toLocaleString()}. For more details, please check your email.`;

    MaytapiWhatsappNotification(
      "91" + response.customer.mobile,
      whatsappMessageContent
    );
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error sending email");
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
        error: "sales_id and content are required",
      });
    }

    // Create the new remarks
    const purchaseData = await Followup.create({
      sales_id: req.body.getPid,
      content: req.body.editorContent,
      next_followup_date: req.body.getfolowup,
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

    // Initialize totalPurchaseAmount and untaxedAmount
    let totalPurchaseAmount = 0;
    let untaxedAmount = 0;

    // Calculate totalPurchaseAmount and untaxedAmount from products
    const products = req.body.products || [];

    if (products.length > 0) {
      products.forEach((product) => {
        const received = parseFloat(product.received);
        const unit_price = parseFloat(product.unit_price);
        const taxRate = parseFloat(product.tax); // Assuming taxRate is a decimal like 0.18 for 18%

        const productUntaxedAmount = received * unit_price;
        const productTotalAmountp = (productUntaxedAmount * taxRate) / 100;
        const productTotalAmount = productUntaxedAmount + productTotalAmountp;

        totalPurchaseAmount += productTotalAmount;
        untaxedAmount += productUntaxedAmount;

        sgstRate = parseFloat(taxRate) / 100;
        cgstRate = parseFloat(taxRate) / 100;
      });
    }

    // Calculate SGST and CGST based on the untaxedAmount
    const sgst = (untaxedAmount * sgstRate) / 2;
    const cgst = (untaxedAmount * cgstRate) / 2;

    // Create Bill record
    const purchaseData = await Recv.create(
      {
        vendor_id: req.body.vendor_id,
        sales_id: req.params.id,
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

    // Create BillProduct records
    if (products.length > 0) {
      const productPromises = products.map(async (product) => {
        console.log("Creating product:", product);

        const received = parseFloat(product.received);
        const unit_price = parseFloat(product.unit_price);
        const taxRate = parseFloat(product.tax);

        const totalAmount = received * unit_price;
        const taxExcl = totalAmount;
        const taxInclp = (totalAmount * taxRate) / 100;
        const taxIncl = totalAmount + taxInclp;

        await RecvProduct.create(
          {
            bill_id: purchaseData.id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty, // You can keep the qty if needed for reference
            unit_price: unit_price,
            tax: taxRate,
            taxExcl: taxExcl,
            taxIncl: taxIncl,
            vendor_id: product.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
            received: received,
            rejected: product.rejected,
            sales_id: req.params.id,
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
      error: "An error occurred while creating the purchase and products",
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
        sales_id: id,
        company_id: req.user.company_id,
        user_id: req.user.id,
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
    res.status(500).json({
      error: "An error occurred while fetching the purchase data",
      details: error.message,
    });
  }
};

// upload PO
exports.UploadPo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.file);

    if (req.file) {
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension !== ".pdf") {
        return res
          .status(400)
          .json({ status: false, message: "Only PDF files are allowed" });
      }
      const poFolder = path.join(__dirname, "../uploads/PO");
      if (!fs.existsSync(poFolder)) {
        fs.mkdirSync(poFolder, { recursive: true });
      }
      const filename = `PO_${id}_${Date.now()}${fileExtension}`;
      const filePath = path.join(poFolder, filename);
      fs.renameSync(req.file.path, filePath);
      await Purchase.update(
        { uploadpo: filename },
        {
          where: {
            id: id,
          },
        }
      );
    }

    return res.status(200).json({ status: true, message: "Success" });
  } catch (err) {
    console.error("Error adding po:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get total reject count
exports.GetAllPurchaseRejectcount = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 8 }],
            },
          ],
        },
      },
    };

    // Get the count of total records
    const totalCount = await Purchase.count(queryConditions);

    // Fetch the products data
    const products = await Purchase.findAll(queryConditions);

    console.log("Products fetched:", products);

    // Respond with the products and total count
    res.status(200).json({
      totalCount,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

// total done
exports.GetAllPurchasedonecount = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 6 }],
            },
          ],
        },
      },
    };

    // Get the count of total records
    const totalCountdone = await Purchase.count(queryConditions);

    // Fetch the products data
    const products = await Purchase.findAll(queryConditions);

    console.log("Products fetched:", products);

    // Respond with the products and total count
    res.status(200).json({
      totalCountdone,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
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
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 2 }],
            },
          ],
        },
      },
    };

    // Get the count of total records
    const totalCountrfq = await Purchase.count(queryConditions);

    // Respond with the products and total count
    res.status(200).json({
      totalCountrfq,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

//approved
exports.GetAllPurchaseapp = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [
            { [Op.ne]: 0 },
            {
              [Op.or]: [{ [Op.eq]: 4 }],
            },
          ],
        },
      },
    };
    // Get the count of total records
    const totalCountapp = await Purchase.count(queryConditions);

    // Respond with the products and total count
    res.status(200).json({
      totalCountapp,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

// order confirm
exports.GetAllPurchasOconfir = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 5,
      },
    };
    // Get the count of total records
    const totalCountocon = await Purchase.count(queryConditions);
    // Respond with the products and total count
    res.status(200).json({
      totalCountocon,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
// Bill Created
exports.GetAllBillcreated = async (req, res) => {
  try {
    // Define the query conditions
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: 6,
      },
    };
    // Get the count of total records
    const totalCountbill = await Purchase.count(queryConditions);
    // Respond with the products and total count
    res.status(200).json({
      totalCountbill,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};

// get done count vendorwise
exports.GetDoneVendorwise = async (req, res) => {
  try {
    // Define the query conditions for the initial count
    const queryConditions = {
      where: {
        company_id: req.user.company_id,
        user_id: req.user.id,
        status: {
          [Op.and]: [{ [Op.ne]: 0 }],
        },
      },
    };

    // Get the count of total records
    const totalCountapp = await Purchase.count(queryConditions);

    // Get the count of records grouped by vendor_id where status is 7
    const vendorStatus7Count = await Purchase.findAll({
      where: {
        status: 7,
      },
      include: [{ model: Vendor, as: "customer" }],
      attributes: [
        "vendor_id",
        [Sequelize.fn("COUNT", Sequelize.col("vendor_id")), "count"],
      ],
      group: ["vendor_id"],
    });

    // Respond with the products, total count, and vendor status 7 count
    res.status(200).json({
      vendorStatus7Count,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products" });
  }
};
//get total

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
    a.sales_id = b.sales_id
WHERE 
    a.user_id = ${req.user.id} 
    AND a.company_id = ${req.user.company_id}
GROUP BY 
    a.created_at;`);
    const purchaseData = results;
    console.log(results, metadata);
    if (!purchaseData.length) {
      // Check if the array is empty

      return res.status(404).json({ error: "No purchase data found" });
    }

    res.status(200).json(purchaseData);
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({
      error: "An error occurred while fetching the purchase data",
      details: error.message,
    });
  }
};

//revised quote entry
exports.AddRevisedPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { salesid } = req.params;

  try {
    let purchaseData;

    const existingPurchase = await PurchaseRe.findOne({
      where: { sales_id: salesid },
      transaction,
    });

    if (existingPurchase) {
      await PurchaseProductRe.destroy({
        where: {
          sales_id: salesid,
        },
        transaction,
      });

      console.log("Updating existing Purchase...");
      await existingPurchase.update(
        {
          customer_id: req.body.customer_id,
          customer_reference: req.body.customer_reference,
          expiration: req.body.expiration,
          dalivery_date: req.body.dalivery_date,
          buyer: req.body.buyer,
          source_document: req.body.source_document,
          payment_terms: req.body.payment_terms,
          total_amount: req.body.total_amount,
          untaxed_amount: req.body.untaxed_amount,
          user_id: req.user.id,
          company_id: req.user.company_id,
          mailsend_status: req.body.mailsend_status || "0",
        },
        { transaction }
      );

      purchaseData = existingPurchase;
    } else {
      console.log("Creating new Purchase...");
      purchaseData = await PurchaseRe.create(
        {
          sales_id: salesid,
          customer_id: req.body.customer_id,
          customer_reference: req.body.customer_reference,
          expiration: req.body.expiration,
          dalivery_date: req.body.dalivery_date,
          buyer: req.body.buyer,
          source_document: req.body.source_document,
          payment_terms: req.body.payment_terms,
          total_amount: req.body.total_amount,
          untaxed_amount: req.body.untaxed_amount,
          user_id: req.user.id,
          company_id: req.user.company_id,
          mailsend_status: req.body.mailsend_status || "0",
        },
        { transaction }
      );
    }

    // Re-insert products
    if (req.body.products && req.body.products.length > 0) {
      console.log("Inserting Purchase Products...");

      const productPromises = req.body.products.map(async (product) => {
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        const totalWithTax = productTotal + taxAmount;

        await PurchaseProductRe.create(
          {
            sales_id: salesid,
            sales_re_id: purchaseData.id,
            customer_id: req.body.customer_id,
            product_id: product.product_id,
            description: product.description,
            qty: product.qty,
            unit_price: product.unit_price,
            tax: product.tax,
            total_amount: req.body.total_amount,
            taxExcl: product.taxExcl,
            taxIncl: totalWithTax, // Store total including tax
            vendor_id: req.body.vendor_id,
            user_id: req.user.id,
            company_id: req.user.company_id,
          },
          { transaction }
        );
      });

      await Promise.all(productPromises);
      console.log("All Purchase Products inserted.");

      const totalPurchaseAmount = req.body.products.reduce((total, product) => {
        const productTotal = product.qty * product.unit_price;
        const taxAmount = (product.tax / 100) * productTotal;
        return total + productTotal + taxAmount;
      }, 0);

      await PurchaseRe.update(
        { total_amount: totalPurchaseAmount },
        { where: { id: purchaseData.id }, transaction }
      );

      console.log("Total Purchase Amount updated:", totalPurchaseAmount);
    }

    await transaction.commit();
    console.log("Transaction committed.");

    const updatedPurchase = await PurchaseRe.findByPk(purchaseData.id);

    res.status(200).json({
      ...updatedPurchase.toJSON(),
      total_amount: updatedPurchase.total_amount,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
      console.error("Transaction rolled back due to error:", error);
    } else {
      console.error("Error occurred after transaction commit:", error);
    }
    res.status(500).json({
      error:
        "An error occurred while creating or updating the purchase and products",
    });
  }
};

exports.GetAllCustomerCount = async (req, res) => {
  try {
    // Fetch all users with status 1
    const users = await Vendor.findAll({
      where: {
        company_id: req.user.company_id,
      },
    });

    // Calculate the total count of users
    const totalCount = users.length;

    // Respond with the users and total count
    return res.status(200).json({
      message: true,
      totalCountuser: totalCount,
    });
  } catch (err) {
    // Handle errors and respond with a 400 status code
    return res.status(400).json(err);
  }
};

//workorderlisting
exports.GetAllWorkOrder = async (req, res) => {
  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const workOrders = await PurchaseProduct.findAll({
      where: {
        company_id: req.user.company_id,
        status: 11,
        is_deleted: { [Op.ne]: 1 },
      },
      include: [
        {
          model: Purchase,
          as: "purchase",
          required: true,
          where: {

            mailsend_status: 1,
          },
          attributes: [
            "id",
            "reference_number",
            "customer_id",
            "total_amount",
            "expiration",
            "created_at",
          ],
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name"] },
            { model: User, as: "createdByUser", attributes: ["id", "name"] },
          ],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: ["id", "product_name", "product_code", "unit"],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
exports.GetAllDdone = async (req, res) => {
  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const workOrders = await PurchaseProduct.findAll({
      where: {
        company_id: req.user.company_id,
        is_deleted: { [Op.ne]: 1 },
      },
      include: [
        {
          model: Purchase,
          as: "purchase",
          required: true,
          where: {
            mailsend_status: 1,
          },
          attributes: [
            "id",
            "reference_number",
            "customer_id",
            "total_amount",
            "expiration",
            "created_at",
          ],
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name"] },
            { model: User, as: "createdByUser", attributes: ["id", "name"] },
          ],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: ["id", "product_name", "product_code", "unit"],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
// exports.GetAlldispatchlist = async (req, res) => {
//   try {
//     if (!req.user?.company_id) {
//       return res.status(400).json({ error: "Company ID is required" });
//     }

//     const workOrders = await PurchaseProduct.findAll({
//       where: {
//         company_id: req.user.company_id,
//         status: 10,
//         is_deleted: { [Op.ne]: 1 },
//       },
//       include: [
//         {
//           model: Purchase,
//           as: "purchase",
//           required: true,
//           where: {

//             mailsend_status: 1,
//           },
//           attributes: [
//             "id",
//             "reference_number",
//             "customer_id",
//             "total_amount",
//             "expiration",
//             "created_at",
//           ],
//           include: [
//             { model: Customer, as: "customer", attributes: ["id", "name"] },
//             { model: User, as: "createdByUser", attributes: ["id", "name"] },
//           ],
//         },
//         {
//           model: Product,
//           as: "ProductsItem",
//           attributes: ["id", "product_name", "product_code", "unit"],
//           include: [
//             {
//               model: MasteruomModel,
//               as: "Masteruom",
//               attributes: ["unit_name"],
//             },
//           ],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     res.status(200).json(workOrders);
//   } catch (error) {
//     console.error("Error fetching work orders:", error);
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// };

exports.GetAlldispatchlist = async (req, res) => {
  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Step 1: Get all records (no status filter) for status comparison
    const allProducts = await PurchaseProduct.findAll({
      where: {
        company_id: req.user.company_id,
        is_deleted: { [Op.ne]: 1 },
      },
    });

    // Step 2: Build a map of sales_id => Set of statuses
    const statusMap = {};
    for (const item of allProducts) {
      const sid = item.sales_id;
      if (!statusMap[sid]) {
        statusMap[sid] = new Set();
      }
      statusMap[sid].add(item.status);
    }

    // Step 3: Fetch filtered results (status = 10)
    const filteredWorkOrders = await PurchaseProduct.findAll({
      where: {
        company_id: req.user.company_id,
        status: 10, // <-- filter applied here only
        is_deleted: { [Op.ne]: 1 },
      },
      include: [
        {
          model: Purchase,
          as: "purchase",
          required: true,
          where: {
            mailsend_status: 1,
          },
          attributes: [
            "id",
            "reference_number",
            "customer_id",
            "total_amount",
            "expiration",
            "created_at",
          ],
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name"] },
            { model: User, as: "createdByUser", attributes: ["id", "name"] },
          ],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: ["id", "product_name", "product_code", "unit"],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Step 4: Add has_mixed_status to filtered result based on full map
    const finalData = filteredWorkOrders.map((item) => {
      const sid = item.sales_id;
      const hasMixedStatus = statusMap[sid] && statusMap[sid].size > 1;
      return {
        ...item.toJSON(),
        has_mixed_status: hasMixedStatus,
      };
    });
    console.log("finalData:", finalData);

    res.status(200).json(finalData);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};



exports.dispatchGetWorkOrder = async (req, res) => {

  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const { id, production_id } = req.body;

    if (!id || !production_id) {
      return res.status(400).json({ error: "Missing ID or Production ID" });
    }

    // Update PurchaseProduct
    const updatedPurchase = await PurchaseProduct.update(
      { is_dispatched: true },
      { where: { id: id } }
    );

    const updatedProduction = await Production.update(
      { is_dispatched: true },
      { where: { production_number: production_id } }
    );


    res.status(200).json({
      message: "Dispatch status updated successfully",
      updatedPurchase,
      updatedProduction,
    });
  } catch (error) {
    console.error("Error dispatching work order:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const { id } = req.params;

    const whereClause = {
      company_id: req.user.company_id,
    };

    if (id) {
      whereClause.id = id;
    }

    const workOrders = await PurchaseProduct.findAll({
      where: whereClause,
      include: [
        {
          model: Purchase,
          as: "purchase",
          required: true,
          where: {
            status: {
              [Op.in]: [10, 11],
            },
            mailsend_status: 1,
          },
          attributes: [
            "id",
            "reference_number",
            "customer_id",
            "dalivery_date",
            "payment_terms",
            "total_amount",
            "expiration",
            "created_at",
          ],
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: [
                "id",
                "name",
                "phone",
                "mobile",
                "address",
                "city",
                "state",
                "country",
                "zip",
                "address2",
                "gstin",
                "pan",
                "website",
              ],
            },
            { model: User, as: "createdByUser", attributes: ["id", "name"] },
            {
              model: CompanyManagement,
              as: "companyManagement",
              attributes: [
                "id",
                "company_name",
                "address",
                "logo",
                "gst",
                "company_phone",
              ],
            },
          ],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: [
            "id",
            "product_name",
            "product_code",
            "unit",
            "hsn_code",
          ],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

exports.IsInvoice = async (req, res) => {
  try {
    const generateInvoiceNumber = () => {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      return `INV${datePart}${randomPart}`;
    };

    const invoiceNumber = generateInvoiceNumber();

    await PurchaseProduct.update(
      {
        is_invoice: true,
        is_dispatched: true,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        invoice_created_by: req.user.id,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );

    res.status(200).json({
      message: "Status updated to invoice.",
      invoice_number: invoiceNumber,
    });
  } catch (error) {
    console.error("Error updating purchase product:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

exports.stockUpdate = async (req, res) => {
  try {
    const { pid, sid } = req.params;
    const company_id = req.user.company_id;
    if (!pid || !sid || !company_id) {
      return res
        .status(400)
        .json({ error: "Product ID, Store ID, or Company ID missing" });
    }

    // Total stock IN
    const totalIn = await TrackProductStock.sum("quantity_changed", {
      where: {
        product_id: pid,
        store_id: sid,

        status_in_out: 1,
      },
    });

    // Total stock OUT
    const totalOut = await TrackProductStock.sum("quantity_changed", {
      where: {
        product_id: pid,
        store_id: sid,
        company_id,
        status_in_out: 0,
      },
    });

    const finalStock = (totalIn || 0) - (totalOut || 0);

    return res.status(200).json({ stock: finalStock });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const generateReferenceNumber = () => {
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // 7-digit
  return `INV${randomNumber}`;
};

// Helper to generate a 16-digit barcode number
const generateBarcodeNumber = () => {
  let barcode = "";
  for (let i = 0; i < 16; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  return barcode;
};

exports.deductStock = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      default_price,
      unit,
      store_id,
      quantity,
    } = req.body;
    console.log(req.body, "xxxx");

    if (
      !product_id ||
      !store_id ||
      !quantity ||
      !product_name ||
      !default_price ||
      !unit
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const reference_number = generateReferenceNumber();
    const barcode_number = generateBarcodeNumber();
    // 🔍 Calculate current stock = IN - OUT
    const totalIn = await TrackProductStock.sum("quantity_changed", {
      where: {
        product_id,

        company_id: req.user.company_id,
        status_in_out: 1,
      },
    });

    const totalOut = await TrackProductStock.sum("quantity_changed", {
      where: {
        product_id,

        company_id: req.user.company_id,
        status_in_out: 0,
      },
    });

    const currentStock = (totalIn || 0) - (totalOut || 0);
    const final_quantity = currentStock - quantity;

    if (final_quantity < 0) {
      return res.status(400).json({ message: "Insufficient stock to deduct." });
    }

    // ✅ Create OUT entry
    await TrackProductStock.create({
      product_id,
      item_name: product_name,
      default_price,
      item_unit: unit,
      store_id,
      quantity_changed: quantity,
      status_in_out: 0, // OUT
      reference_number,
      barcode_number,
      user_id: req.user.id,
      company_id: req.user.company_id,
      adjustmentType: "Delivery to User",
      final_quantity,
    });

    return res
      .status(200)
      .json({ message: "Stock deducted successfully.", final_quantity });
  } catch (error) {
    console.error("Error in deductStock:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


//for report
exports.GetAllWorkOrderForReport = async (req, res) => {
  try {
    if (!req.user?.company_id) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const workOrders = await PurchaseProduct.findAll({
      where: {
        company_id: req.user.company_id,
        is_deleted: { [Op.ne]: 1 },
        is_invoice: { [Op.ne]: false },
      },
      include: [
        {
          model: Purchase,
          as: "purchase",
          required: true,
          where: {
            //status: 9,
            mailsend_status: 1,
          },
          attributes: [
            "id",
            "reference_number",
            "customer_id",
            "total_amount",
            "expiration",
            "created_at",
          ],
          include: [
            { model: Customer, as: "customer", attributes: ["id", "name"] },
            { model: User, as: "createdByUser", attributes: ["id", "name"] },
          ],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: ["id", "product_name", "product_code", "unit", 'product_category'],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
            {
              model: ProductCategories,
              as: 'Categories',
              attributes: ["title"],
            }
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

exports.salesLedger = async (req, res) => {
  try {
    const { customer_id, startDate, endDate } = req.body;

    let conditions = "";
    // Ensure customer_id is a valid number
    if (customer_id && !isNaN(customer_id)) {
      conditions += ` AND s.customer_id = ${customer_id}`;
    }

    // Add date range filter
    if (startDate && endDate) {
      conditions += ` AND DATE(sp.invoice_date) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const query = `
      SELECT 
        c.name AS customer_name,
        s.reference_number,
        sp.qty,
        p.product_name AS product_name,
        sp.taxIncl,
        sp.invoice_number,
        sp.invoice_date,
        p.id AS product_id,
        sp.production_status,
         sp.production_number,
        sp.is_dispatched
      FROM sales_product sp
      JOIN sale s ON s.id = sp.sales_id
      JOIN product p ON p.id = sp.product_id
      JOIN customer c ON c.id = s.customer_id
      WHERE 1=1 ${conditions}
      ORDER BY sp.invoice_date DESC
    `;


    const [results] = await sequelize.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Ledger fetch error:", error);
    res.status(500).json({ error: "Failed to fetch ledger." });
  }
};



exports.getProductsByPurchase = async (req, res) => {
  try {
    const salesRef = req.params.id;

    if (!salesRef) {
      return res.status(400).json({ error: "Reference number is required" });
    }

    const products = await PurchaseProduct.findAll({
      where: {
        is_deleted: { [Op.ne]: 1 },
      },
      include: [
        {
          model: Purchase,
          as: "purchase",
          where: {
            reference_number: salesRef,
          },
          attributes: ["id", "reference_number"],
        },
        {
          model: Product,
          as: "ProductsItem",
          attributes: ["product_name", "product_code"],
          include: [
            {
              model: MasteruomModel,
              as: "Masteruom",
              attributes: ["unit_name"],
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by reference number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
