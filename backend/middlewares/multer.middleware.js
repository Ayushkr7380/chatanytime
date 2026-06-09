import path from 'path';
import multer from 'multer';

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        // Naming the file to include a timestamp to prevent overwriting
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer file filter and size limit configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.jfif','.webp', '.mp4'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            return cb(new Error(`Unsupported file type ${ext}`), false);
        }

        cb(null, true);
    }
});

export default upload;
