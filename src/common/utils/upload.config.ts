import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const EXPENSE_UPLOAD_DIR = join(process.cwd(), 'uploads', 'expenses');

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export function ensureExpenseUploadDir(): void {
  mkdirSync(EXPENSE_UPLOAD_DIR, { recursive: true });
}

export const expenseMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureExpenseUploadDir();
      cb(null, EXPENSE_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] ?? '.bin';
      cb(null, `expense-${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!MIME_TO_EXT[file.mimetype]) {
      return cb(
        new BadRequestException('Only JPG, PNG, WEBP, or PDF files are allowed'),
        false,
      );
    }
    cb(null, true);
  },
};