const { where } = require("sequelize");
const Vendor = require("../model/Vendor");

const User = require("../model/User");
const { CompressImage } = require("../utils/ImageUpload");

const Bank = require("../model/Bank");

const XLSX = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { uploadDir } = require("../utils/handlersbluk");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const CompanyManagementModel = require("../model/CompanyManagement");


exports.UploadVendors = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res
        .status(400)
        .json({ status: false, message: "No file uploaded" });
    }
    const filePath = path.join(uploadDir, req.file.filename);

    console.log(`File path: ${filePath}`); // Log the file path

    const ext = path.extname(req.file.filename).toLowerCase();
    console.log(`File extension: ${ext}`); // Log the file extension

    const categories = [];

    if (ext == ".xlsx" || ext == ".xls") {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      data.forEach((row) => {
        categories.push({
          vendor_name: row.vendor_name,
          type: row.type,
          address: row.address,
          address2: row.address2,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
          gst_treatment: row.gst_treatment,
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
      res
        .status(200)
        .json({ status: true, message: "Success", data: categories });
    } else if (ext === ".csv") {
      // Read CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          categories.push({
            vendor_name: row.vendor_name,
            type: row.type,
            address: row.address,
            address2: row.address2,
            city: row.city,
            state: row.state,
            zip: row.zip,
            country: row.country,
            gst_treatment: row.gst_treatment,
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
        })
        .on("end", async () => {
          await saveVendors(categories, req.user.id, req.user.company_id);
          return res
            .status(200)
            .json({ status: true, message: "Success", data: categories });
        });
    } else {
      console.error("Invalid file type");
      return res
        .status(400)
        .json({ status: false, message: "Invalid file type" });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error processing file:", err);
    res
      .status(500)
      .json({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
  }
};

// Function to save vendors to the database
const saveVendors = async (categories, userId, companyId) => {
  for (const category of categories) {
    const vendor = await Vendor.create({
      vendor_name: category.vendor_name,
      type: category.type,
      address: category.address,
      address2: category.address2,
      city: category.city,
      state: category.state,
      zip: category.zip,
      country: category.country,
      gst_treatment: category.gst_treatment,
      gstin: category.gstin,
      pan: category.pan,
      phone: category.phone,
      mobile: category.mobile,
      email: category.email,
      website: category.website,
      user_id: userId,
      company_id: companyId,
    });

    await Bank.create({
      account_number: category.account_number,
      bank_name: category.bank_name,
      account_holder: category.account_holder,
      ifsc_code: category.ifsc_code,
      vendor_id: vendor.id,
    });
  }
};

async function findGSTN(gstn) {
  const gst = await Vendor.findOne({ where: { gstin: gstn } });
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



exports.AddVendor = async (req, res) => {
  try {
    // let fgstn = await findGSTN(req.body.gstin);

    const VendorData = await Vendor.create({
      vendor_name: req.body.vendor_name,
      type: req.body.type,
      address: req.body.address,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      country: req.body.country,
      gst_treatment: req.body.gst_treatment,
      gstin: req.body.gstin,
      pan: req.body.pan,
      phone: req.body.phone,
      mobile: req.body.mobile,
      email: req.body.email,
      website: req.body.website,
      user_id: req.user.id,
      company_id: req.user.company_id,
      tags: req.body.tags,

    });


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
        await Vendor.update(
          { attachment_file: uploadResult.url },
          { where: { id: VendorData.id } }
        );
      } else {
        return res.status(500).json({ status: false, message: uploadResult.message });
      }
    }


    if (req.body.account_number) {
      const BankData = await Bank.create({
        vendor_id: VendorData.id,
        account_number: req.body.account_number,
        bank_name: req.body.bank_name,
        account_holder: req.body.account_holder,
        ifsc_code: req.body.ifsc_code,
      });
    }

    return res.status(200).json({ status: true, message: "success", data: VendorData });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.UpdateVendor = async (req, res) => {
  try {
    const VendorId = req.params.id;
    let attachment_file = null;

    const updatedRowsCount = await Vendor.update(
      {
        vendor_name: req.body.vendor_name,
        type: req.body.type,
        address: req.body.address,
        country: req.body.country,
        address2: req.body.address2,
        gst_treatment: req.body.gst_treatment,
        gstin: req.body.gstin,
        pan: req.body.pan,
        phone: req.body.phone,
        mobile: req.body.mobile,
        email: req.body.email,
        website: req.body.website,
        user_id: req.user.id,
        company_id: req.user.company_id,
        tags: req.body.tags,
        ratings: req.body.ratings,
      },
      { where: { id: VendorId } }
    );

    if (req.file) {
      const company = await CompanyManagementModel.findOne({
        where: { id: req.user.company_id },
        attributes: ['company_name'],
      });

      const companyName = company?.company_name || "DefaultCompany";
      const uploadResult = await UploadFileToAWS(req.file, companyName);
      if (uploadResult.status) {
        attachment_file = uploadResult.url;
        await Vendor.update(
          { attachment_file: uploadResult.url },
          { where: { id: VendorId } }
        );
      } else {
        return res.status(500).json({ status: false, message: uploadResult.message });
      }
    }

    const BankData = await Bank.update(
      {
        account_number: req.body.account_number,
        bank_name: req.body.bank_name,
        account_holder: req.body.account_holder,
        ifsc_code: req.body.ifsc_code,
      },
      { where: { vendor_id: VendorId } }
    );

    return res.status(200).json({ status: true, message: "Record Updated", data: BankData });

  } catch (err) {
    return res.status(400).json({ status: false, error: err.message });
  }
};

exports.GetAllVendors = async (req, res) => {
  //return res.send('yesy');
  try {
    company_id = req.user.company_id;
    user_id = req.user.id;
    const getAllVendor = await Vendor.findAll({
      where: {
        company_id: company_id,
        user_id: user_id,
        status: 1,
      },
      order: [["id", "DESC"]],
      include: [
        {
          model: Bank,
          as: "bank",
          attributes: [
            "account_number",
            "bank_name",
            "account_holder",
            "ifsc_code",
            "primary_account",
            "created_at",
          ],
        },
      ],
    });
    return res.status(200).json({ message: true, data: getAllVendor });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.DeleteVendors = async (req, res) => {
  try {
    const VendorId = req.params.id;

    if (!VendorId || isNaN(VendorId)) {
      return res.status(400).json({ message: "Invalid Vendor ID" });
    }

    const vendor = await Vendor.findOne({ where: { id: VendorId } });

    if (vendor) {
      //await Vendor.destroy({ where: { id: VendorId } });
      // Update only the status field to 1
      const updatedRowsCount = await Vendor.update(
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




///import to tally
