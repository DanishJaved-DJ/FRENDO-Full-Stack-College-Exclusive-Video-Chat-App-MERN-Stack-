import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';

export const extractTextFromImage = async (imagePath) => {
  const processedImagePath = imagePath.replace(/\.(jpg|jpeg|png)$/, '_processed.png');

  await sharp(imagePath)
    .grayscale()
    .normalize()
    .toFile(processedImagePath);

  const { data: { text } } = await Tesseract.recognize(processedImagePath, 'eng');

  fs.unlinkSync(processedImagePath); // cleanup

  return text;
};
