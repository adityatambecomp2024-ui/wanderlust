const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
    timeout: 60000, // 60 seconds timeout
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Major_project_ENV',
      allowedFormats: async (req, file) => ['png',"jpeg","jpg"],
    },
  });

  module.exports={cloudinary,storage,};