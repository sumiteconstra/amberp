const express = require("express");
const XLSX = require("xlsx");
require('dotenv').config();
const bcrypt = require("bcrypt");
const cors = require("cors");
const xml2js = require('xml2js');
const Excel = require('exceljs');
//define all route
const user = require("./router/UserRoute");
const task = require("./router/TaskTrackerRoute");
const product = require("./router/ProductRoute");
const taskProperties = require("./router/TaskPropertiesRoute");
const category = require("./router/ProductCategoryRoute");
const { whatsappNotification, MaytapiWhatsappNotification, sendMail, sendToTally } = require("./utils/Helper");
const vendor = require("./router/VendorRoute");
const purchase = require("./router/PurchaseRoute");
const settings = require("./router/SettingRoute");
const company = require("./router/CompanyRoute");
const customer = require("./router/CustomerRoute");
const sales = require("./router/SalesRoute");
const moduledata = require("./router/moduleRoutes");
const roledata = require("./router/roleRoutes");
const permission = require("./router/rolePermissionRoutes");
const production = require("./router/ProductionRoute");
const axios = require('axios');
const RolePermission = require("./router/RolePermissionRoute");

const { bulkupload, uploadDir } = require("./utils/handlersbluk");
const path = require("path");
//Database connection
require('./db/db')

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('uploads'));
app.use(express.static('utils/uploads'));

app.use(express.static('pdf'));
app.use("/api/user", user);
app.use("/api/task", task);
app.use("/api/product", product);
app.use("/api/category", category);
app.use("/api/vendor", vendor);
app.use("/api/purchase", purchase);
//sales
app.use("/api/customer", customer);
app.use("/api/sales", sales);
app.use("/api/", settings);
app.use("/api/module", moduledata);
app.use("/api/roles", roledata);
app.use("/api/api", permission);

app.use("/api", RolePermission)
app.use("/api/company", company)
//Production
app.use("/api/production", production);
//app.use("/api/", taskProperties);




app.get("/", async (req, res) => {
    try {

        // const phoneNumber = '919163220851';
        // const message = 'this is test message';
        // // whatsappNotification(phoneNumber,message)
        // // MaytapiWhatsappNotification(phoneNumber,message)
        // const info = await sendMail(
        //     'sudipta.econstra@gmail.com', 
        //     'Test Subject',
        //     'Hello world?', 
        //     '<b>Hello world?</b>' 
        // );

        return res.status(200).json("info");
    } catch (err) {
        res.status(400).json("error occure")
    }
})

// API to Import Vendor Data into Tally
// app.post("/import-vendor", async (req, res) => {
//     const { name, address, gstNumber } = req.body;

//     const xmlRequest = `
//       <ENVELOPE>
//   <HEADER>
//     <TALLYREQUEST>Import Data</TALLYREQUEST>
//   </HEADER>
//   <BODY>
//     <IMPORTDATA>
//       <REQUESTDESC>
//         <REPORTNAME>All Masters</REPORTNAME>
//       </REQUESTDESC>
//       <REQUESTDATA>
//         <TALLYMESSAGE xmlns:UDF="TallyUDF">
//           <LEDGER NAME="SSUJIT INFOTECH" ACTION="Create">
//             <NAME>SSUJIT INFOTECH</NAME>
//             <MAILINGNAME>SSUJIT INFOTECH</MAILINGNAME>
//             <ADDRESS.LIST>
//               <ADDRESS>Kolkata 3009</ADDRESS>
//             </ADDRESS.LIST>
//             <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
//             <PARTYGSTIN>27SDFFDFSXXX1Z5</PARTYGSTIN>
//             <LEDGERMOBILE>9864534552</LEDGERMOBILE>
//             <PARENT>Sundry Creditors</PARENT>
//             <ISBILLWISEON>Yes</ISBILLWISEON>
//             <OPENINGBALANCE>0</OPENINGBALANCE>
//           </LEDGER>
//         </TALLYMESSAGE>
//       </REQUESTDATA>
//     </IMPORTDATA>
//   </BODY>
// </ENVELOPE>


//     `;

//     try {
//       const response = await sendToTally(xmlRequest);
//       res.send(response);
//     } catch (error) {
//       res.status(500).send("Failed to import vendor");
//     }
//   });
// const fs = require("fs");
// const multer = require("multer");
// const path = require("path");
// const uploadDir1 = "uploads"; // Directory to store uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir1);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = file.originalname;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/import-vendors", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ status: false, message: "No file uploaded" });
//     }

//     const filePath = path.join(uploadDir, req.file.filename);
//     const ext = path.extname(req.file.filename).toLowerCase();
//     const vendors = [];

//     if (ext === ".xlsx" || ext === ".xls") {
//       const workbook = XLSX.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       const data = XLSX.utils.sheet_to_json(sheet);

//       data.forEach((row) => {
//         vendors.push({
//           vendor_name: row["vendor_name"],
//           type: row["type"] || "Sundry Creditors",
//           address: row["address"],
//           city: row["city"],
//           state: row["state"],
//           zip: row["zip"],
//           country: row["country"],
//           gst_treatment: row["gst_treatment"],
//           gstin: row["gstin"],
//           pan: row["pan"],
//           phone: row["phone"],
//           mobile: row["mobile"],
//           email: row["email"],
//           website: row["website"],
//           account_number: row["account_number"],
//           bank_name: row["bank_name"],
//           account_holder: row["account_holder"],
//           ifsc_code: row["ifsc_code"],
//         });
//       });
//     } else if (ext === ".csv") {
//       await new Promise((resolve, reject) => {
//         fs.createReadStream(filePath)
//           .pipe(csv({ headers: true, trim: true }))
//           .on("data", (row) => {
//             vendors.push({
//               vendor_name: row["vendor_name"],
//               type: row["type"] || "Sundry Creditors",
//               address: row["address"],
//               city: row["city"],
//               state: row["state"],
//               zip: row["zip"],
//               country: row["country"],
//               gst_treatment: row["gst_treatment"],
//               gstin: row["gstin"],
//               pan: row["pan"],
//               phone: row["phone"],
//               mobile: row["mobile"],
//               email: row["email"],
//               website: row["website"],
//               account_number: row["account_number"],
//               bank_name: row["bank_name"],
//               account_holder: row["account_holder"],
//               ifsc_code: row["ifsc_code"],
//             });
//           })
//           .on("end", resolve)
//           .on("error", reject);
//       });
//     } else {
//       return res.status(400).json({ status: false, message: "Invalid file type" });
//     }

//     // Generate Tally XML for all vendors
//     const xmlBody = vendors
//       .map((vendor) => {
//         return `
//         <TALLYMESSAGE xmlns:UDF="TallyUDF">
//           <LEDGER NAME="${vendor.vendor_name}" ACTION="Create">
//             <NAME>${vendor.vendor_name}</NAME>
//             <MAILINGNAME>${vendor.vendor_name}</MAILINGNAME>
//             <ADDRESS.LIST>
//               <ADDRESS>${vendor.address}</ADDRESS>
//               <ADDRESS>${vendor.city}, ${vendor.state}, ${vendor.zip}</ADDRESS>
//               <ADDRESS>${vendor.country}</ADDRESS>
//             </ADDRESS.LIST>
//             <GSTREGISTRATIONTYPE>${vendor.gst_treatment}</GSTREGISTRATIONTYPE>
//             <PARTYGSTIN>${vendor.gstin}</PARTYGSTIN>
//             <PAN>${vendor.pan}</PAN>
//             <LEDGERPHONE>${vendor.phone}</LEDGERPHONE>
//             <LEDGERMOBILE>${vendor.mobile}</LEDGERMOBILE>
//             <EMAIL>${vendor.email}</EMAIL>
//             <WEBSITE>${vendor.website}</WEBSITE>
//             <BANKDETAILS.LIST>
//               <BANKNAME>${vendor.bank_name}</BANKNAME>
//               <ACCOUNTNUMBER>${vendor.account_number}</ACCOUNTNUMBER>
//               <ACCOUNTHOLDER>${vendor.account_holder}</ACCOUNTHOLDER>
//               <IFSC>${vendor.ifsc_code}</IFSC>
//             </BANKDETAILS.LIST>
//             <PARENT>Sundry Creditors</PARENT>
//             <ISBILLWISEON>Yes</ISBILLWISEON>
//             <OPENINGBALANCE>0</OPENINGBALANCE>
//           </LEDGER>
//         </TALLYMESSAGE>`;
//       })
//       .join("");

//     const xmlRequest = `
//       <ENVELOPE>
//         <HEADER>
//           <TALLYREQUEST>Import Data</TALLYREQUEST>
//         </HEADER>
//         <BODY>
//           <IMPORTDATA>
//             <REQUESTDESC>
//               <REPORTNAME>All Masters</REPORTNAME>
//             </REQUESTDESC>
//             <REQUESTDATA>
//               ${xmlBody}
//             </REQUESTDATA>
//           </IMPORTDATA>
//         </BODY>
//       </ENVELOPE>
//     `;

//     // Send XML to Tally
//     const response = await sendToTally(xmlRequest);
//     //fs.unlinkSync(filePath); // Clean up the file
//     res.status(200).json({ status: true, message: "Vendors imported successfully", response });
//   } catch (error) {
//     console.error("Error importing vendors:", error);
//     res.status(500).json({ status: false, message: "Failed to import vendors", error: error.message });
//   }
// });


//export



// app.get('/export-ledgers', async (req, res) => {
//   const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
//   <ENVELOPE>
//       <HEADER>
//           <TALLYREQUEST>Export Data</TALLYREQUEST>
//       </HEADER>
//       <BODY>
//           <EXPORTDATA>
//               <REQUESTDESC>
//                   <REPORTNAME>Ledger</REPORTNAME>
//                   <STATICVARIABLES>
//                       <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
//                   </STATICVARIABLES>
//               </REQUESTDESC>
//           </EXPORTDATA>
//       </BODY>
//   </ENVELOPE>`;

//       try {
//           const response = await axios.post('http://localhost:9000', xmlRequest, {
//               headers: {
//                   'Content-Type': 'text/xml',
//               },
//           });

//           console.log("Raw Response:", response);

//           // Parse the XML response
//           xml2js.parseString(response.data, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
//               if (err) {
//                   console.error("Error parsing XML response:", err);
//                   return;
//               }

//               console.log("Parsed Response:", JSON.stringify(result, null, 2));

//               // Extract ledger data from the response
//               const ledgerData = result?.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE;
//               if (!ledgerData) {
//                   console.error("No ledger data found");
//                   return;
//               }

//               const ledgers = Array.isArray(ledgerData) ? ledgerData.map((entry) => entry.LEDGER) : [ledgerData.LEDGER];
//               const extractedData = ledgers.map((ledger) => ({
//                   name: ledger.NAME,
//                   mailingName: ledger.MAILINGNAME,
//                   gstin: ledger.PARTYGSTIN,
//                   openingBalance: ledger.OPENINGBALANCE,
//               }));

//               console.log("Extracted Ledgers:", extractedData);
//           });
//       } catch (error) {
//           console.error("Error fetching data from Tally:", error);
//       }
// });
app.use('/api', express.static(path.join(__dirname, 'uploads')));
require('./cron/stockAlerts.jsx'); 
app.use('/api/PO', express.static(path.join(__dirname, 'pdf')));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server start http://localhost:${process.env.PORT}`,);
})



