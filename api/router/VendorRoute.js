
const express = require("express");
const { AddVendor, GetAllVendors, DeleteVendors, UpdateVendor, UploadVendors } = require("../controller/VendorController");
const { authToken } = require("../utils/Middleware");
const { upload } = require("../utils/ImageUpload");
const bulkupload  = require("../utils/handlersbluk");
const router = express.Router();

router.post('/add',authToken, upload.single('file'), AddVendor);
router.get("/all-Vendors",authToken,GetAllVendors);
router.post("/update/:id",authToken, upload.single('file'), UpdateVendor);
router.delete('/:id', DeleteVendors);
router.post('/upload', authToken, bulkupload.upload.single('file'), UploadVendors);
module.exports = router;