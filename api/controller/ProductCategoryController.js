const { Op } = require("sequelize");
const User = require("../model/User");
const ProductCategories = require("../model/ProductCategory");

const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { uploadDir } = require("../utils/handlersbluk");
exports.UploadCategory = async (req, res) => {
   try {
      if (!req.file) {
          console.error('No file uploaded');
          return res.status(400).json({ status: false, message: 'No file uploaded' });
      }
      const filePath = path.join(uploadDir, req.file.filename);

      console.log(`File path: ${filePath}`); // Log the file path

      const ext = path.extname(req.file.filename).toLowerCase();
      console.log(`File extension: ${ext}`); // Log the file extension

      const categories = [];

      if (ext == '.xlsx' || ext == '.xls') {
          // Read Excel file
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);

          data.forEach(row => {
              categories.push({ title: row.Category });
          });
          await saveCategories(categories, req.user.id, req.user.company_id);
          res.status(200).json({ status: true, message: "Success", data: categories });
      } else if (ext === '.csv') {
          // Read CSV file
          fs.createReadStream(filePath)
              .pipe(csv())
              .on('data', (row) => {
                  categories.push({ title: row.title });
              })
              .on('end', async () => {
                  await saveCategories(categories, req.user.id, req.user.company_id);
                  return res.status(200).json({ status: true, message: "Success", data: categories });
              });
      } else {
          console.error('Invalid file type');
          return res.status(400).json({ status: false, message: 'Invalid file type' });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

  } catch (err) {
      console.error("Error processing file:", err);
      res.status(500).json({ status: false, message: "Internal Server Error", error: err.message });
  }
};

// Function to save categories to the database
const saveCategories = async (categories, userId, companyId) => {
  for (const category of categories) {
      await ProductCategories.create({
          title: category.title,
          user_id: userId,
          company_id: companyId,
      });
  }
};

exports.AddProductCat = async (req, res) => {
    try {
     //return res.send(req.user);
        const { error } = await ProductCategories.validate({
            "title": req.body.catname,
        });
        if (error) {
            return res.status(400).json({ error: error.details });
        }
        const ProductCategoriesData = await ProductCategories.create({
          
            title: req.body.catname,
            user_id: req.user.id,
            company_id: req.user.company_id,
        })
        return res.status(200).json({ status: true, message: "Success", data: ProductCategories  });
    } catch (err) {
      // Log the error and return error response
      console.error("Error inserting data:", err);
      return res.status(500).json({ status: false, message: "Internal Server Error", error: err.message });
  }

}

exports.UpdateProductCat = async (req, res) => {
    
    try {
      const { error } = await ProductCategories.validate({
        "title": req.body.catname,
    });
    if (error) {
      return res.status(400).json({ error: error.details });
  }
        const productId = req.params.id;
        const updatedRowsCount = await ProductCategories.update(
            {  title: req.body.catname,
                status: req.body.status,
             },
            { where: { id: productId } }
          );

        return res.status(200).json({ status: true, message: "Record Updated", data: ProductCategories });
    } catch (err) {
        return res.status(400).json(err)
    }

}

exports.GetAllProductscat = async (req, res) => {
    try {
        const getAllProduct = await ProductCategories.findAll({
            where: {
              user_id: req.user.id,
              company_id: req.user.company_id,
                status: {
                    [Op.ne]: 2
                }
            }, order: [
                ['title', 'ASC']
            ]
        })
        return res.status(200).json({ message: true, data: getAllProduct,'cat': getAllProduct});

    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.GetAllProductscatupdate = async (req, res) => {
  
  try {
    const catid = req.params.id;
    
    const getAllProductdata = await ProductCategories.findOne({ where: { id: catid } });
    //return res.send(getAllProductdata);
    if (!getAllProductdata) {
      return res.status(404).json({ message: "Product category not found" });
    }

    return res.status(200).json({ message: "success", data: getAllProductdata });
  } catch (err) {
    console.error('Error fetching product category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

  exports.DeleteProductscat = async (req, res) => {
    try {
      const productId = req.params.id;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }
      const product = await ProductCategories.findOne({ where: { id: productId } });
      if (product) {
        //await Product.destroy({ where: { id: productId } });
        // Update only the status field to 1
        const updatedRowsCount = await ProductCategories.update(
            { status: '2' },
            { where: { id: productId } }
          );
          
        res.json({ message: "Item removed" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
// Add this method to handle the update
// exports.GetAllProductscatupdate = async (req, res) => {
//   try {
//       const { id } = req.params;
//       const { title, description, price } = req.body;

//       // Validate the request body
//       const { error } = validateProductCategory(req.body);
//       if (error) {
//           return res.status(400).json({ error: error.details });
//       }

//       // Find and update the product category
//       const productCategory = await ProductCategory.findByPk(id);
//       if (!productCategory) {
//           return res.status(404).json({ message: 'Product category not found' });
//       }

//       productCategory.title = title;
     

//       await productCategory.save();

//       // Return success response
//       return res.status(200).json({ status: true, message: "Success", data: productCategory });
//   } catch (err) {
//       // Log the error and return error response
//       console.error("Error updating data:", err);
//       return res.status(500).json({ status: false, message: "Internal Server Error", error: err.message });
//   }
// };