require('dotenv').config();
const { Pool } = require('pg');
const { uploadToCloudinary, extractPublicId } = require('../config/cloudinary');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 將Base64轉換為Buffer
function base64ToBuffer(base64String) {
    // 移除data:image/...;base64,前綴
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

// 檢查是否為Base64圖片
function isBase64Image(str) {
    return str && str.startsWith('data:image/');
}

// 遷移pets表中的圖片
async function migratePetsImages() {
    console.log('🔄 開始遷移pets表中的圖片...');
    
    try {
        // 獲取所有包含Base64圖片的pets記錄
        const result = await pool.query(`
            SELECT id, images 
            FROM pets 
            WHERE images IS NOT NULL 
            AND images != '[]'::jsonb
        `);
        
        console.log(`📊 找到 ${result.rows.length} 筆寵物記錄需要遷移`);
        
        for (const pet of result.rows) {
            console.log(`\n處理寵物ID: ${pet.id}`);
            
            try {
                const images = JSON.parse(pet.images);
                const newImages = [];
                
                for (let i = 0; i < images.length; i++) {
                    const imageData = images[i];
                    
                    if (isBase64Image(imageData)) {
                        console.log(`  📤 上傳第 ${i + 1} 張圖片到Cloudinary...`);
                        
                        // 轉換Base64為Buffer
                        const buffer = base64ToBuffer(imageData);
                        
                        // 上傳到Cloudinary
                        const uploadResult = await uploadToCloudinary(buffer, 'pets');
                        
                        console.log(`  ✅ 上傳成功: ${uploadResult.secure_url}`);
                        newImages.push(uploadResult.secure_url);
                        
                        // 添加延遲避免API限制
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        // 如果已經是URL，直接保留
                        newImages.push(imageData);
                    }
                }
                
                // 更新數據庫
                await pool.query(
                    'UPDATE pets SET images = $1 WHERE id = $2',
                    [JSON.stringify(newImages), pet.id]
                );
                
                console.log(`  💾 寵物ID ${pet.id} 圖片遷移完成`);
                
            } catch (error) {
                console.error(`❌ 寵物ID ${pet.id} 遷移失敗:`, error.message);
            }
        }
        
        console.log('\n🎉 pets表圖片遷移完成！');
        
    } catch (error) {
        console.error('❌ pets表遷移失敗:', error);
        throw error;
    }
}

// 遷移gallery_images表中的圖片
async function migrateGalleryImages() {
    console.log('\n🔄 開始遷移gallery_images表中的圖片...');
    
    try {
        // 獲取所有包含Base64圖片的gallery記錄
        const result = await pool.query(`
            SELECT id, src, title 
            FROM gallery_images 
            WHERE src IS NOT NULL
        `);
        
        console.log(`📊 找到 ${result.rows.length} 筆相簿記錄需要檢查`);
        
        for (const image of result.rows) {
            console.log(`\n處理相簿ID: ${image.id} - ${image.title}`);
            
            try {
                if (isBase64Image(image.src)) {
                    console.log(`  📤 上傳圖片到Cloudinary...`);
                    
                    // 轉換Base64為Buffer
                    const buffer = base64ToBuffer(image.src);
                    
                    // 上傳到Cloudinary
                    const uploadResult = await uploadToCloudinary(buffer, 'gallery');
                    
                    console.log(`  ✅ 上傳成功: ${uploadResult.secure_url}`);
                    
                    // 更新數據庫
                    await pool.query(
                        'UPDATE gallery_images SET src = $1 WHERE id = $2',
                        [uploadResult.secure_url, image.id]
                    );
                    
                    console.log(`  💾 相簿ID ${image.id} 圖片遷移完成`);
                    
                    // 添加延遲避免API限制
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log(`  ⏭️  已經是URL格式，跳過`);
                }
                
            } catch (error) {
                console.error(`❌ 相簿ID ${image.id} 遷移失敗:`, error.message);
            }
        }
        
        console.log('\n🎉 gallery_images表圖片遷移完成！');
        
    } catch (error) {
        console.error('❌ gallery_images表遷移失敗:', error);
        throw error;
    }
}

// 檢查數據庫容量
async function checkDatabaseSize() {
    try {
        console.log('\n📊 檢查數據庫容量...');
        
        const sizeResult = await pool.query(`
            SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;
        `);
        
        const tableResult = await pool.query(`
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        `);
        
        console.log(`\n📈 數據庫總大小: ${sizeResult.rows[0].database_size}`);
        console.log('\n📋 各表大小:');
        tableResult.rows.forEach(row => {
            console.log(`  ${row.tablename}: ${row.size}`);
        });
        
    } catch (error) {
        console.error('❌ 檢查數據庫容量失敗:', error);
    }
}

// 主執行函數
async function main() {
    console.log('🚀 開始圖片遷移到Cloudinary...\n');
    
    // 檢查環境變數
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ 缺少Cloudinary環境變數，請檢查.env文件');
        process.exit(1);
    }
    
    try {
        // 遷移前檢查數據庫大小
        await checkDatabaseSize();
        
        // 執行遷移
        await migratePetsImages();
        await migrateGalleryImages();
        
        // 遷移後再次檢查數據庫大小
        console.log('\n🔍 遷移完成後的數據庫狀況:');
        await checkDatabaseSize();
        
        console.log('\n🎊 所有圖片遷移完成！');
        console.log('💡 建議：運行VACUUM FULL清理數據庫空間');
        
    } catch (error) {
        console.error('❌ 遷移過程發生錯誤:', error);
    } finally {
        await pool.end();
    }
}

// 執行遷移
if (require.main === module) {
    main();
}

module.exports = { main, migratePetsImages, migrateGalleryImages }; 