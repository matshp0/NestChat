import * as sharp from 'sharp';

export async function validateAvatar(imageBuffer: Buffer) {
  try {
    const { format, width, height } = await sharp(imageBuffer).metadata();
    const isJpeg = format === 'jpeg';
    const isSized = width === 400 && height === 400;
    return isJpeg && isSized;
  } catch {
    return false;
  }
}
