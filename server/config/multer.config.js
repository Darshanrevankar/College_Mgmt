import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('./uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: uploadDir, 
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

const uploadImage = upload.single('image');

export default uploadImage;
