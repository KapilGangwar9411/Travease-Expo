const { admin } = require('../config/firebase');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  }
});

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - File object from multer
 * @param {string} userId - User ID to be used in file path
 * @returns {Promise<string>} - Download URL of the uploaded file
 */
const uploadToFirebase = async (file, userId) => {
  try {
    // Create directory for uploads if it doesn't exist
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/');
    }

    // Set up the Firebase Storage bucket
    const bucket = admin.storage().bucket();
    
    // Define destination path in Firebase Storage
    const destination = `users/${userId}/profile/${path.basename(file.path)}`;
    
    // Upload the file to Firebase Storage
    await bucket.upload(file.path, {
      destination: destination,
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    // Get the file reference
    const fileRef = bucket.file(destination);
    
    // Make the file publicly accessible
    await fileRef.makePublic();
    
    // Get the public URL of the file
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    // Delete the temporary file
    await unlinkFile(file.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToFirebase
}; 