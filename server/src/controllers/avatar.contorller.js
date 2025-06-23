import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js"; // buffer-based upload util
import cloudinary from "cloudinary";


const uploadAvatar = async (req, res) => {
  try {
    // ✅ Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Fetch user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Delete old avatar from Cloudinary (if exists)
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // ✅ Upload new avatar from memory buffer
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const uploadResponse = await uploadOnCloudinary(fileBuffer, "avatars"); // folder optional

    if (!uploadResponse) {
      return res.status(500).json({ success: false, message: "Failed to upload to Cloudinary" });
    }

    // ✅ Save new avatar details
    user.avatarUrl = uploadResponse.secure_url;
    user.avatarPublicId = uploadResponse.public_id;
    await user.save();

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: user.avatarUrl,
    });

  } catch (err) {
    console.error("[Upload Avatar Error]", err);
    res.status(500).json({ success: false, message: "Avatar upload failed" });
  }
};

export default uploadAvatar;
