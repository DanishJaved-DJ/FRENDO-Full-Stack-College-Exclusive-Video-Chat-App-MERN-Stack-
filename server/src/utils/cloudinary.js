import {v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
  try {
    if(!localFilePath) return null;

    //upload
    console.log("uploading...");
    
      const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        });
 
        // file hasbeen uploaded
        fs.unlinkSync(localFilePath);
        // console.log("file has been uploaed successfully on cloudinary", response.url);
        return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); 
    //remove the temporary local file as uploader operation fails
    console.log("error while cloudinary upload");
    
    return null;
  }
       
}

export default uploadOnCloudinary;