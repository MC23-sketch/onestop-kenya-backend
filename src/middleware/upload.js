const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine upload folder based on fieldname
        let uploadPath = 'uploads/';
        
        if (file.fieldname === 'productImages') {
            uploadPath += 'products/';
        } else if (file.fieldname === 'categoryImage') {
            uploadPath += 'categories/';
        } else {
            uploadPath += 'misc/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

// Export different upload configurations
module.exports = {
    uploadSingle: upload.single('image'),
    uploadProductImages: upload.array('productImages', 5),
    uploadCategoryImage: upload.single('categoryImage'),
    uploadMultiple: upload.array('images', 10)
};

