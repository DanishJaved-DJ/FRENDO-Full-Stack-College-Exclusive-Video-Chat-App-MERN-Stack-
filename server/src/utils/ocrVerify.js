import Tesseract from "tesseract.js";
import sharp from "sharp";
import axios from "axios";

export const extractTextFromImage = async (imageUrl) => {
  try {
    // ✅ 1. Download image as buffer
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const inputBuffer = Buffer.from(response.data);

    // ✅ 2. Preprocess with sharp (in memory)
    const processedBuffer = await sharp(inputBuffer)
      .grayscale()
      .normalize()
      .png()
      .toBuffer();

    // ✅ 3. OCR on processed buffer
    const result = await Tesseract.recognize(processedBuffer, "eng");

    return result.data.text;

  } catch (err) {
    console.error("OCR extraction failed:", err);
    return "";
  }
};
