import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
        return {
            folder: 'eduslide-pro',
            resource_type: 'raw',
            allowed_formats: ['pdf', 'ppt', 'pptx'],
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
        };
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and PowerPoint files are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    },
});

export { cloudinary };
