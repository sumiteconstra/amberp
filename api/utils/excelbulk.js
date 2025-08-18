const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  console.log(`File MIME Type: ${mimeType}`);
  console.log(`File Extension: ${fileExtension}`);

  if (allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(mimeType)) {
    cb(null, true); // File is valid
  } else {
    cb(new Error('Only .xlsx and .xls files are allowed!')); // File is invalid
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
