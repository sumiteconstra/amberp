const { where } = require("sequelize");
const Customer = require("../model/Customer");

const User = require("../model/User");
const { CompressImage } = require("../utils/ImageUpload");

const Bank = require("../model/Bank");

const XLSX = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { uploadDir } = require("../utils/handlersbluk");
const Customerbank = require("../model/CustomerBank");
const CompanyManagementModel = require("../model/CompanyManagement");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

exports.UploadCustomers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }

    if (!req.user || !req.user.id || !req.user.company_id) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    const ext = path.extname(req.file.filename).toLowerCase();
    const categories = [];

    if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      data.forEach((row) => {
        console.log("Excel Row:", row);
        categories.push({
          name: row.name,
          type: row.type,
          address: row.address,
          address2: row.address2,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
          sales_person: row.sales_person,
          gstin: row.gstin,
          pan: row.pan,
          phone: row.phone,
          mobile: row.mobile,
          email: row.email,
          website: row.website,
          account_number: row.account_number,
          bank_name: row.bank_name,
          account_holder: row.account_holder,
          ifsc_code: row.ifsc_code,
          user_id: req.user.id,
          company_id: req.user.company_id,
        });
      });

      await saveVendors(categories, req.user.id, req.user.company_id);
      fs.unlinkSync(filePath); // safe to delete here
      return res.status(200).json({ status: true, message: "Success", data: categories });

    } else if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          console.log("CSV Row:", row);
          categories.push({
            ...row,
            user_id: req.user.id,
            company_id: req.user.company_id,
          });
        })
        .on("end", async () => {
          try {
            await saveVendors(categories, req.user.id, req.user.company_id);
            fs.unlinkSync(filePath);
            return res.status(200).json({ status: true, message: "Success", data: categories });
          } catch (err) {
            console.error("Error saving CSV vendors:", err);
            return res.status(500).json({ status: false, message: "CSV Save Error", error: err.message });
          }
        });

    } else {
      return res.status(400).json({ status: false, message: "Invalid file type" });
    }

  } catch (err) {
    console.error("Error processing file:", err);
    return res.status(500).json({ status: false, message: "Internal Server Error", error: err.message });
  }
};


// Function to save vendors to the database
const saveVendors = async (categories, userId, companyId) => {
  for (const category of categories) {
    const vendor = await Customer.create({
      name: category.name,
      type: category.type,
      address: category.address,
      address2: category.address2,
      city: category.city,
      state: category.state,
      zip: category.zip,
      country: category.country,
      sales_person: category.sales_person,
      gstin: category.gstin,
      pan: category.pan,
      phone: category.phone,
      mobile: category.mobile,
      email: category.email,
      website: category.website,
      user_id: userId,
      company_id: companyId,


    });

    await Customerbank.create({
      account_number: category.account_number,
      bank_name: category.bank_name,
      account_holder: category.account_holder,
      ifsc_code: category.ifsc_code,
      customer_id: vendor.id,
    });
  }
};

async function findGSTN(gstn) {
  const gst = await Customer.findOne({ where: { gstin: gstn } });
  return gst ? gst.id : null;
}
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
exports.AddCustomer = async (req, res) => {
  //try {
  // let fgstn = await findGSTN(req.body.gstin);

  const VendorData = await Customer.create({
    name: req.body.name,
    type: req.body.type,
    address: req.body.address,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    country: req.body.country,
    sales_person: req.body.sales_person,
    gstin: req.body.gstin,
    pan: req.body.pan,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    website: req.body.website,
    tags: req.body.tags,
    user_id: req.user.id,
    company_id: req.user.company_id,
  });


  // if (req.file) {
  //   const filename = await CompressImage(req.file);

  //   await Customer.update(
  //     { attachment_file: filename },
  //     {
  //       where: {
  //         id: VendorData.id,
  //       },
  //     }
  //   );
  // }




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
      attachment_file = uploadResult.url;
      await Customer.update(
        { attachment_file: uploadResult.url },
        { where: { id: VendorData.id } }
      );
    } else {
      return res.status(500).json({ status: false, message: uploadResult.message });
    }
  }
  if (req.body.account_number) {
    const BankData = await Customerbank.create({
      customer_id: VendorData.id,
      account_number: req.body.account_number,
      bank_name: req.body.bank_name,
      account_holder: req.body.account_holder,
      ifsc_code: req.body.ifsc_code,
    });
  }

  return res.status(200).json({ status: true, message: "success", data: VendorData });

  //   } catch (err) {
  //     res.status(500).json({ message: "Server error" });
  //   }
};

exports.UpdateCustomer = async (req, res) => {
  // try {
    const VendorId = req.params.id;

    const updatedRowsCount = await Customer.update(
      {
        name: req.body.name,
        type: req.body.type,
        address: req.body.address,
        address2: req.body.address2,
        sales_person: req.body.sales_person,
        gstin: req.body.gstin,
        pan: req.body.pan,
        phone: req.body.phone,
        country: req.body.country,
        mobile: req.body.mobile,
        email: req.body.email,
        website: req.body.website,
        tags: req.body.tags,
        ratings: req.body.ratings,
        user_id: req.user.id,
        company_id: req.user.company_id,
      },
      { where: { id: VendorId } }
    );

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
      attachment_file = uploadResult.url;
      await Customer.update(
        { attachment_file: uploadResult.url },
        { where: { id:VendorId } }
      );
    } else {
      return res.status(500).json({ status: false, message: uploadResult.message });
    }
  }
    const BankData = await Customerbank.update(
      {
        account_number: req.body.account_number,
        bank_name: req.body.bank_name,
        account_holder: req.body.account_holder,
        ifsc_code: req.body.ifsc_code,
      },
      { where: { customer_id: VendorId } }
    );

    return res
      .status(200)
      .json({ status: true, message: "Record Updated", data: BankData });
  // } catch (err) {
  //   return res.status(400).json(err);
  // }
};
exports.GetAllCustomer = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Customer.findAndCountAll({
      where: {
        company_id: company_id,
        status: 1,
      },
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
      raw: true,
    });
    const result = [];

    for (const customer of rows) {
      const bankData = await Customerbank.findAll({
        where: { customer_id: customer.id },
        attributes: [
          'account_number',
          'bank_name',
          'account_holder',
          'ifsc_code',
          'primary_account',
          'created_at',
        ],
        raw: true,
      });

      result.push({
        ...customer,
        bank: bankData,
      });
    }

    return res.status(200).json({
      message: true,
      data: result,
      total: count,
      page,
      pageSize,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};


exports.DeleteCustomer = async (req, res) => {
  try {
    const VendorId = req.params.id;

    if (!VendorId || isNaN(VendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }

    const vendor = await Customer.findOne({ where: { id: VendorId } });

    if (vendor) {
      //await Vendor.destroy({ where: { id: VendorId } });
      // Update only the status field to 1
      const updatedRowsCount = await Customer.update(
        { status: "2" },
        { where: { id: VendorId } }
      );
      res.json({ message: "Item removed" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error deleting Vendor:", error);
    res.status(500).json({ message: "Server error" });
  }
};
