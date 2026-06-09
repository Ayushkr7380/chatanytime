import server from "./app.js"
import DbConfig from "./config/dbconfig.js";
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';

// Ensure uploads/ folder exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const PORT = process.env.PORT || 2000;

server.listen(PORT,async()=>{
    await DbConfig();
    console.log(`Server is running at PORT ${PORT}`);
})