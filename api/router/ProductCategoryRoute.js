
const express = require("express");
const { AddProductCat, GetAllProductscat, UpdateProductCat, DeleteProductscat, GetAllProductscatupdate, UploadCategory } = require("../controller/ProductCategoryController");
const { authToken } = require("../utils/Middleware");
const { upload }  = require("../utils/handlersbluk");

const router = express.Router();

router.post('/add-cat',authToken, AddProductCat);
router.get("/all-products-cat",authToken,GetAllProductscat);
// router.get("/all-products-catupdate/:id",authToken, GetAllProductscatupdate);
router.put("/updatecat/:id",authToken,UpdateProductCat);
router.delete('/:id',authToken, DeleteProductscat);
router.post('/upload', authToken, upload.single('file'), UploadCategory);

module.exports = router;