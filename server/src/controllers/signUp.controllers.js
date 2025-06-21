import User from '../models/user.models.js';
import {extractTextFromImage} from '../utils/ocrVerify.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword , collegeName } = req.body;
    const collegeIdProof = req.file?.path;
    
    console.log('Received file path:', collegeIdProof);

    if (!username || !email || !password || !confirmPassword || !collegeIdProof || !collegeName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // OCR verification
    const ocrText = await extractTextFromImage(collegeIdProof);
    const lowerText = ocrText.toLowerCase();

    const nameWords = username.toLowerCase().split(/\s+/).filter(Boolean);
    const collegeWords = collegeName.toLowerCase().split(/\s+/).filter(Boolean);

    console.log(`Name Words: ${nameWords}`);
    console.log(`College Words: ${collegeWords}`);
    

    const nameMatch = nameWords.every(word => lowerText.includes(word));
    const collegeMatch = collegeWords.every(word => lowerText.includes(word));
  
    console.log(nameMatch, collegeMatch);
    
    
     
    if (!nameMatch || !collegeMatch) {
      return res.status(400).json({
        message: 'OCR verification failed: make sure your college ID contains your name and college name clearly.',
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      collegeName,
      collegeIdProof,
      isVerified: true, // Mark as verified if OCR passes
    });

    await newUser.save();

    res.status(201).json({status: 'success', message: 'Signup successful and verified via OCR.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'false', message: 'Signup failed. Server error.' });
  }
};
