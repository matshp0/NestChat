// stream-storage.ts
import { StorageEngine } from 'multer';
import { Request } from 'express';

export function StreamStorage(): StorageEngine {
  return {
    _handleFile(
      req: Request,
      file: Express.Multer.File & { stream: NodeJS.ReadableStream },
      cb,
    ) {
      // file.stream is the readable stream directly from busboy (no buffering)

      // Example: pipe stream somewhere
      file.stream.pipe(process.stdout); // Or upload to S3, write to DB, etc.

      // Multer expects to call cb when "storing" is done
      cb(null, {
        filename: file.originalname,
        path: 'streamed', // optional info
      });
    },

    _removeFile(req: Request, file: Express.Multer.File, cb) {
      cb(null);
    },
  };
}
