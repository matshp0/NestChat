import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';

type Callback = (error: Error | null, acceptFile: boolean) => void;

export const avatarFilter = async (
  req: any,
  file: Express.Multer.File,
  callback: Callback,
) => {
  if (file.mimetype !== 'image/jpeg') {
    callback(new BadRequestException('Jpeg 400x400 expected'), false);
  }
  try {
    const { format, width, height } = await sharp(file.buffer).metadata();
    const isJpeg = format === 'jpeg';
    const isSized = width === 400 && height === 400;
    return isJpeg && isSized;
  } catch {
    callback(new BadRequestException('Jpeg 400x400 expected'), false);
  }
  callback(null, true);
};
