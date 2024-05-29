import cloudinary from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploads = async (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({
          url: result.url,
          publicId: result.public_id,
          assetId: result.asset_id,
          signature: result.signature,
        });
      },
      {
        resource_type: 'auto',
        folder: folder,
      }
    );
  });
};

const uploader = async (path) => {
  return await cloudinaryUploads(path, 'reactNativeRealtimeChatApp');
};

const singleFileUpload = async (file, res) => {
  try {
    const { path } = file;
    const newPath = await uploader(path);

    fs.unlinkSync(path);
    return newPath;
  } catch (error) {
    console.log(error);
  }
};

const multipleFileUpload = async (files, res) => {
  const urls = [];
  for (const file of files) {
    const { path } = file;

    try {
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(newPath);
    } catch (error) {
      console.log(error);
    }
  }
  return urls;
};

const uploadFile = async (req, res) => {
  try {
    let newPath;
    console.log('newPath:', req.files);
    // return;
    if (req.file) {
      newPath = await singleFileUpload(req.file, res);
    }
    if (req.files && req.files.length > 1) {
      console.log('array for multiple files');
      newPath = await multipleFileUpload(req.files, res);
    } else if (req.files && req.files.length === 1) {
      console.log('array with single file');
      newPath = await singleFileUpload(req.files[0], res);
    }

    return newPath;
  } catch (error) {
    console.log(error);
  }
};

const destroyFileUpload = async (public_id) => {
  const publicIdsArray = Array.isArray(public_id) ? public_id : [public_id];
  const deletePromise = publicIdsArray.map(async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
    }
  });
};

export { uploadFile, destroyFileUpload };
