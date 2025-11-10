import { BadRequestException } from '@nestjs/common';

type Callback = (error: Error | null, acceptFile: boolean) => void;

export const mimetypeFilter = (types: string[]) => {
  return (req: any, file: Express.Multer.File, callback: Callback) => {
    if (!types.includes(file.mimetype)) {
      callback(new BadRequestException('Jpeg file expected'), false);
    }
    callback(null, true);
  };
};
