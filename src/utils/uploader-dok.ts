import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp"; // <--- library untuk image processing

const UPLOADS_DIR = path.join(__dirname, "../../uploads/dokumentasi");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const generateUniqueFilename = (originalName: string) => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}-${uuidv4()}${ext}`;
};

const getFilePathFromUrl = (fileUrl: string) => {
  const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  return path.join(UPLOADS_DIR, filename);
};

export default {
  async uploadSingle(file: Express.Multer.File) {
    try {
      const filename = generateUniqueFilename(file.originalname);
      const filePath = path.join(UPLOADS_DIR, filename);

      // 🔹 Compress gambar sebelum disimpan
      await sharp(file.buffer)
        .resize({ width: 1024 }) // opsional, ubah ukuran maksimal width
        .jpeg({ quality: 80 }) // kompres kualitas JPEG ke 80%
        .toFile(filePath);

      return {
        url: `/uploads/dokumentasi/${filename}`,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: fs.statSync(filePath).size,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  },

  async uploadMultiple(files: Express.Multer.File[]) {
    try {
      const uploadPromises = files.map(file => this.uploadSingle(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Failed to upload multiple files: ${error}`);
    }
  },

  async remove(fileUrl: string) {
    try {
      const filePath = getFilePathFromUrl(fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true, message: "File deleted successfully" };
      } else {
        return { success: false, message: "File not found" };
      }
    } catch (error) {
      throw new Error(`Failed to remove file: ${error}`);
    }
  },
};
