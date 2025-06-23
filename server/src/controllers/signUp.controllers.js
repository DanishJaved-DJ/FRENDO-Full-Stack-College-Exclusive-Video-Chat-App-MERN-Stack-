import User from '../models/user.models.js';
import { extractTextFromImage } from '../utils/ocrVerify.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, collegeName } = req.body;
    const fileBuffer = req.file?.buffer;

    if (!username || !email || !password || !confirmPassword || !fileBuffer || !collegeName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // ✅ Upload file to Cloudinary
    const cloudUpload = await uploadOnCloudinary(fileBuffer, "college-id-proofs");
    if (!cloudUpload) {
      return res.status(500).json({ message: 'Failed to upload ID proof.' });
    }

    const collegeIdProofUrl = cloudUpload.secure_url;
    const collegeIdProofPublicId = cloudUpload.public_id;

    // ✅ OCR Verification on the image URL
    const ocrText = await extractTextFromImage(collegeIdProofUrl);
    const lowerText = ocrText.toLowerCase();

    const nameWords = username.toLowerCase().split(/\s+/).filter(Boolean);
    const collegeWords = collegeName.toLowerCase().split(/\s+/).filter(Boolean);

    const nameMatch = nameWords.every(word => lowerText.includes(word));
    const collegeMatch = collegeWords.every(word => lowerText.includes(word));

    if (!nameMatch || !collegeMatch) {
      return res.status(400).json({
        message: 'OCR verification failed: make sure your college ID contains your name and college name clearly.',
      });
    }

    // ✅ Save new user
    const newUser = new User({
      username,
      email,
      password,
      collegeName,
      collegeIdProof: collegeIdProofUrl,
      collegeIdProofPublicId: collegeIdProofPublicId,
      isVerified: true,
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: 'Signup successful and verified via OCR.',
    });

  } catch (err) {
    console.error('[Signup Error]', err);
    res.status(500).json({ status: 'false', message: 'Signup failed. Server error.' });
  }
};
