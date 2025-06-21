
import { log } from "console";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import cloudinary from "cloudinary";

const uploadAvatar = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: 'false', message: 'Unauthorized: User not authenticated' });
    }

    // Fetch user from database
    const user = await User.findById(req.user._id);

    console.log("User found in uploadAvatar:", user);
    if (!user) {
      return res.status(404).json({ status: 'false', message: 'User not found' });
    }

    // Delete old avatar if it exists
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // Save new avatar details
    let avatarUrlLocalFile = req.file?.path;
    user.avatarPublicId = req.file?.filename; // public_id from Cloudinary

    const uploadResponse = await uploadOnCloudinary(avatarUrlLocalFile);
    if (uploadResponse) {
      user.avatarUrl = uploadResponse.secure_url;
    }
    else {
      return res.status(500).json({ status: 'false', message: 'Failed to upload avatar to Cloudinary' });
    }
    await user.save();
    console.log("Avatar uploaded successfully:", user.avatarUrl);
    
    res.json({ success: true, message: "Avatar uploaded successfully", avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Avatar upload failed" });
  }
}

export default uploadAvatar;