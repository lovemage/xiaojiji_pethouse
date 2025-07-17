const cloudinary = require('cloudinary').v2;

// Cloudinary 配置
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 上傳圖片到 Cloudinary
const uploadToCloudinary = async (buffer, folder = 'pet-house') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                format: 'jpg',
                quality: 'auto:best',
                fetch_format: 'auto',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto:best' },
                    { format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};

// 刪除 Cloudinary 圖片
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('刪除 Cloudinary 圖片失敗:', error);
        throw error;
    }
};

// 從 URL 提取 public_id
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // Cloudinary URL 格式: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return matches ? matches[1] : null;
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary,
    extractPublicId
}; 