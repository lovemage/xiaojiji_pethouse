const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanOldGalleryImages() {
  try {
    console.log('開始清理舊格式的相簿圖片資料...');
    
    // 查詢所有相簿圖片
    const result = await pool.query('SELECT id, title, src FROM gallery_images');
    console.log('找到', result.rows.length, '張圖片');
    
    let deletedCount = 0;
    
    for (const image of result.rows) {
      // 更安全的刪除條件：只刪除明確是舊檔案格式的圖片
      // 1. 不是 Base64 格式 (data:)
      // 2. 不是靜態檔案 (images/)
      // 3. 包含檔案擴展名但不在 uploads/ 目錄中 (這些是舊的上傳檔案)
      const isOldUploadFile = !image.src.startsWith('data:') && 
                             !image.src.startsWith('images/') && 
                             !image.src.startsWith('uploads/') &&
                             /\.(jpg|jpeg|png|gif|webp)$/i.test(image.src);
      
      if (isOldUploadFile) {
        console.log('刪除舊格式圖片:', image.id, image.title, image.src);
        
        await pool.query('DELETE FROM gallery_images WHERE id = $1', [image.id]);
        deletedCount++;
      } else {
        console.log('保留圖片:', image.id, image.title, image.src.startsWith('data:') ? '[Base64]' : image.src);
      }
    }
    
    console.log('清理完成，共刪除', deletedCount, '張舊格式圖片');
    
    // 查詢剩餘的圖片
    const remainingResult = await pool.query('SELECT id, title, src FROM gallery_images');
    console.log('剩餘', remainingResult.rows.length, '張圖片');
    
    remainingResult.rows.forEach(image => {
      const srcPreview = image.src.startsWith('data:') ? '[Base64 圖片]' : image.src;
      console.log('- ID:', image.id, '標題:', image.title, '來源:', srcPreview);
    });
    
  } catch (error) {
    console.error('清理失敗:', error);
  } finally {
    await pool.end();
  }
}

cleanOldGalleryImages(); 