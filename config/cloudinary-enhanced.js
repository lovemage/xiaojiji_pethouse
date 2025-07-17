const cloudinary = require('cloudinary').v2;

// Cloudinary 配置
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 上傳圖片到 Cloudinary (增強版)
const uploadToCloudinary = async (buffer, folder = 'pet-house') => {
    return new Promise((resolve, reject) => {
        // 建立不同用途的轉換預設
        const transformations = {
            // 列表頁縮圖
            thumbnail: {
                width: 400,
                height: 300,
                crop: 'fill',
                gravity: 'auto',
                quality: 'auto:low',
                format: 'auto'
            },
            // 詳細頁主圖
            display: {
                width: 1200,
                height: 800,
                crop: 'limit',
                quality: 'auto:best',
                format: 'auto'
            }
        };

        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                eager: [transformations.thumbnail], // 預先生成縮圖
                eager_async: true,
                transformation: transformations.display,
                // 添加自動標籤和分析
                categorization: 'google_tagging',
                auto_tagging: 80,
                // 備份原圖
                backup: true,
                // 使用獨特ID避免衝突
                use_filename: false,
                unique_filename: true,
                // 添加上傳時間戳
                context: `uploaded_at=${new Date().toISOString()}`
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary 上傳錯誤:', error);
                    reject(error);
                } else {
                    // 返回包含不同版本的URL
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        thumbnail_url: result.eager[0]?.secure_url || result.secure_url,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                        created_at: result.created_at
                    });
                }
            }
        ).end(buffer);
    });
};

// 批量上傳（避免並發過多）
const batchUpload = async (buffers, folder = 'pet-house', concurrency = 3) => {
    const results = [];
    
    for (let i = 0; i < buffers.length; i += concurrency) {
        const batch = buffers.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(buffer => uploadToCloudinary(buffer, folder))
        );
        results.push(...batchResults);
        
        // 避免超過API限制
        if (i + concurrency < buffers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return results;
};

// 生成優化的圖片URL
const getOptimizedUrl = (publicId, options = {}) => {
    const defaults = {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
        dpr: 'auto', // 自動DPR
        responsive: true,
        progressive: true // 漸進式載入
    };
    
    const transformation = { ...defaults, ...options };
    
    return cloudinary.url(publicId, {
        secure: true,
        transformation: transformation
    });
};

// 刪除 Cloudinary 圖片（包含所有衍生版本）
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true, // 清除CDN快取
            resource_type: 'image'
        });
        return result;
    } catch (error) {
        console.error('刪除 Cloudinary 圖片失敗:', error);
        throw error;
    }
};

// 從 URL 提取 public_id（改進版）
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // 支援多種URL格式
    const patterns = [
        // 標準格式
        /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
        // 帶轉換參數的格式
        /\/upload\/[^\/]+\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
        // 簡短格式
        /\/([^\/]+?)(?:\.[^.]+)?$/
    ];
    
    for (const pattern of patterns) {
        const matches = url.match(pattern);
        if (matches) {
            return matches[1];
        }
    }
    
    return null;
};

// 檢查使用量
const checkUsage = async () => {
    try {
        const usage = await cloudinary.api.usage();
        return {
            plan: usage.plan,
            credits: {
                used: usage.credits.usage,
                limit: usage.credits.limit,
                remaining: usage.credits.limit - usage.credits.usage,
                percentage: (usage.credits.usage / usage.credits.limit) * 100
            },
            storage: {
                used_bytes: usage.storage.usage,
                used_gb: (usage.storage.usage / 1024 / 1024 / 1024).toFixed(2),
                limit_bytes: usage.storage.limit,
                limit_gb: (usage.storage.limit / 1024 / 1024 / 1024).toFixed(2),
                percentage: (usage.storage.usage / usage.storage.limit) * 100
            },
            bandwidth: {
                used_bytes: usage.bandwidth.usage,
                used_gb: (usage.bandwidth.usage / 1024 / 1024 / 1024).toFixed(2),
                limit_bytes: usage.bandwidth.limit,
                limit_gb: (usage.bandwidth.limit / 1024 / 1024 / 1024).toFixed(2),
                percentage: (usage.bandwidth.usage / usage.bandwidth.limit) * 100
            }
        };
    } catch (error) {
        console.error('檢查Cloudinary使用量失敗:', error);
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    batchUpload,
    getOptimizedUrl,
    deleteFromCloudinary,
    extractPublicId,
    checkUsage
};