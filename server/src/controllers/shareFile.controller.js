import uploadOnCloudinary from "../utils/cloudinary.js";

export const shareFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadOnCloudinary(file.buffer, "frendo-files");

    if (!result) {
      return res.status(500).json({ error: "Cloudinary upload failed" });
    }

    return res.status(200).json({
      fileUrl: result.secure_url,
      fileName: file.originalname,
      fileType: result.resource_type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
