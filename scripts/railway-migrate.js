const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;

// 配置Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 數據庫連接池，優先使用公共URL，回退到內建URL
const getDatabaseUrl = () => {
    // 如果有DATABASE_PUBLIC_URL環境變數，使用它
    if (process.env.DATABASE_PUBLIC_URL) {
        return process.env.DATABASE_PUBLIC_URL;
    }
    
    // 否則，嘗試從DATABASE_URL構建公共URL
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes('postgres.railway.internal')) {
        // 替換內部主機名為公共代理
        return dbUrl.replace(
            'postgres.railway.internal:5432',
            'shortline.proxy.rlwy.net:53574'
        );
    }
    
    // 最後回退到原始URL
    return dbUrl;
};

const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: {
        rejectUnauthorized: false
    }
});

// 顏色輸出
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 上傳圖片到Cloudinary
async function uploadToCloudinary(buffer, folder = 'pet-house') {
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
}

// 將Base64轉換為Buffer
function base64ToBuffer(base64String) {
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

// 檢查是否為Base64圖片
function isBase64Image(str) {
    return str && str.startsWith('data:image/');
}

// 遷移pets表中的Base64圖片
async function migratePetsImages() {
    console.log(colors.blue('🔄 開始遷移pets表中的Base64圖片...'));
    
    let client;
    let migratedCount = 0;
    let errorCount = 0;
    
    try {
        client = await pool.connect();
        
        // 獲取包含Base64圖片的pets記錄
        const query = `
            SELECT id, breed, images 
            FROM pets 
            WHERE images IS NOT NULL 
            AND images != '[]'::jsonb 
            AND images::text LIKE '%data:image%'
            ORDER BY id
        `;
        
        const result = await client.query(query);
        console.log(colors.cyan(`📊 找到 ${result.rows.length} 個包含Base64圖片的寵物記錄`));
        
        for (const row of result.rows) {
            try {
                console.log(colors.blue(`\n🔄 處理寵物 ID: ${row.id} (${row.breed})`));
                
                const images = Array.isArray(row.images) ? row.images : JSON.parse(row.images);
                const newImages = [];
                
                for (let i = 0; i < images.length; i++) {
                    const imageData = images[i];
                    
                    if (isBase64Image(imageData)) {
                        console.log(colors.yellow(`   📷 上傳第 ${i + 1} 張圖片...`));
                        
                        const buffer = base64ToBuffer(imageData);
                        const uploadResult = await uploadToCloudinary(buffer, `pet-house/pets`);
                        
                        newImages.push(uploadResult.secure_url);
                        console.log(colors.green(`   ✅ 上傳成功: ${uploadResult.secure_url.substring(0, 50)}...`));
                        
                        // 小延遲避免API限制
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } else {
                        // 保留非Base64圖片（已經是URL或路徑）
                        newImages.push(imageData);
                        console.log(colors.cyan(`   ⏭️  保留現有圖片: ${imageData}`));
                    }
                }
                
                // 更新數據庫
                const updateQuery = 'UPDATE pets SET images = $1 WHERE id = $2';
                await client.query(updateQuery, [JSON.stringify(newImages), row.id]);
                
                migratedCount++;
                console.log(colors.green(`✅ 寵物 ID ${row.id} 遷移完成 (${newImages.length} 張圖片)`));
                
            } catch (error) {
                errorCount++;
                console.log(colors.red(`❌ 寵物 ID ${row.id} 遷移失敗: ${error.message}`));
            }
        }
        
    } catch (error) {
        console.log(colors.red(`❌ pets表遷移過程出錯: ${error.message}`));
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
    
    console.log(colors.green(`\n📊 pets表遷移完成: ${migratedCount} 成功, ${errorCount} 失敗`));
    return { migratedCount, errorCount };
}

// 遷移gallery_images表中的Base64圖片
async function migrateGalleryImages() {
    console.log(colors.blue('\n🔄 開始遷移gallery_images表中的Base64圖片...'));
    
    let client;
    let migratedCount = 0;
    let errorCount = 0;
    
    try {
        client = await pool.connect();
        
        // 檢查gallery_images表是否存在
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'gallery_images'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log(colors.yellow('⚠️  gallery_images表不存在，跳過'));
            return { migratedCount: 0, errorCount: 0 };
        }
        
        // 獲取包含Base64圖片的gallery_images記錄
        const query = `
            SELECT id, title, src 
            FROM gallery_images 
            WHERE src IS NOT NULL 
            AND src LIKE 'data:image%'
            ORDER BY id
        `;
        
        const result = await client.query(query);
        console.log(colors.cyan(`📊 找到 ${result.rows.length} 個Base64相簿圖片`));
        
        for (const row of result.rows) {
            try {
                console.log(colors.blue(`\n🔄 處理相簿圖片 ID: ${row.id} (${row.title || '無標題'})`));
                
                if (isBase64Image(row.src)) {
                    const buffer = base64ToBuffer(row.src);
                    const uploadResult = await uploadToCloudinary(buffer, `pet-house/gallery`);
                    
                    // 更新數據庫
                    const updateQuery = 'UPDATE gallery_images SET src = $1 WHERE id = $2';
                    await client.query(updateQuery, [uploadResult.secure_url, row.id]);
                    
                    migratedCount++;
                    console.log(colors.green(`✅ 相簿圖片 ID ${row.id} 遷移完成`));
                    console.log(colors.green(`   新URL: ${uploadResult.secure_url.substring(0, 50)}...`));
                    
                    // 小延遲避免API限制
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    console.log(colors.cyan(`⏭️  跳過非Base64圖片: ${row.src.substring(0, 50)}...`));
                }
                
            } catch (error) {
                errorCount++;
                console.log(colors.red(`❌ 相簿圖片 ID ${row.id} 遷移失敗: ${error.message}`));
            }
        }
        
    } catch (error) {
        console.log(colors.red(`❌ gallery_images表遷移過程出錯: ${error.message}`));
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
    
    console.log(colors.green(`📊 gallery_images表遷移完成: ${migratedCount} 成功, ${errorCount} 失敗`));
    return { migratedCount, errorCount };
}

// 檢查數據庫狀態
async function checkDatabaseStatus() {
    let client;
    try {
        client = await pool.connect();
        
        console.log(colors.blue('📊 檢查數據庫狀態...'));
        
        // 檢查pets表Base64圖片數量
        const petsQuery = `
            SELECT 
                COUNT(*) as total_pets,
                COUNT(CASE WHEN images::text LIKE '%data:image%' THEN 1 END) as base64_pets
            FROM pets 
            WHERE images IS NOT NULL AND images != '[]'::jsonb
        `;
        const petsResult = await client.query(petsQuery);
        
        console.log(colors.cyan(`pets表: ${petsResult.rows[0].total_pets} 總寵物, ${petsResult.rows[0].base64_pets} 含Base64圖片`));
        
        // 檢查gallery_images表
        try {
            const galleryQuery = `
                SELECT 
                    COUNT(*) as total_gallery,
                    COUNT(CASE WHEN src LIKE 'data:image%' THEN 1 END) as base64_gallery
                FROM gallery_images
            `;
            const galleryResult = await client.query(galleryQuery);
            
            console.log(colors.cyan(`gallery_images表: ${galleryResult.rows[0].total_gallery} 總圖片, ${galleryResult.rows[0].base64_gallery} 含Base64圖片`));
        } catch (error) {
            console.log(colors.yellow('gallery_images表不存在或查詢失敗'));
        }
        
    } catch (error) {
        console.log(colors.red(`❌ 數據庫狀態檢查失敗: ${error.message}`));
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// 主遷移函數
async function main() {
    console.log(colors.green('🚀 開始Railway CDN圖片遷移...'));
    
    try {
        // 檢查環境變數
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('缺少Cloudinary環境變數');
        }
        
        if (!process.env.DATABASE_URL) {
            throw new Error('缺少DATABASE_URL環境變數');
        }
        
        console.log(colors.green('✅ 環境變數檢查完成'));
        
        // 檢查數據庫狀態
        await checkDatabaseStatus();
        
        // 執行遷移
        const petsResult = await migratePetsImages();
        const galleryResult = await migrateGalleryImages();
        
        const totalMigrated = petsResult.migratedCount + galleryResult.migratedCount;
        const totalErrors = petsResult.errorCount + galleryResult.errorCount;
        
        console.log(colors.green('\n🎉 遷移完成！'));
        console.log(colors.green(`✅ 總共成功遷移: ${totalMigrated} 張圖片`));
        if (totalErrors > 0) {
            console.log(colors.red(`❌ 失敗: ${totalErrors} 張圖片`));
        }
        
        console.log(colors.blue('\n📊 建議執行數據庫清理:'));
        console.log('   echo "VACUUM FULL;" | railway connect Postgres');
        
    } catch (error) {
        console.log(colors.red(`❌ 遷移過程發生錯誤: ${error.message}`));
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// 執行遷移
if (require.main === module) {
    main().catch(error => {
        console.error(colors.red('遷移失敗:'), error);
        process.exit(1);
    });
}

module.exports = {
    migratePetsImages,
    migrateGalleryImages,
    checkDatabaseStatus
}; 