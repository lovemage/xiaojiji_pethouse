const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkGalleryImages() {
  try {
    console.log('檢查相簿圖片格式...');
    
    // 查詢所有相簿圖片
    const result = await pool.query('SELECT id, title, src, created_at FROM gallery_images ORDER BY created_at DESC');
    console.log('找到', result.rows.length, '張圖片');
    
    let base64Count = 0;
    let staticFileCount = 0;
    let oldFormatCount = 0;
    
    result.rows.forEach(image => {
      const srcPreview = image.src.length > 50 ? image.src.substring(0, 50) + '...' : image.src;
      
      if (image.src.startsWith('data:')) {
        base64Count++;
        console.log('✅ Base64 圖片:', image.id, image.title, '[Base64 格式]', new Date(image.created_at).toLocaleString());
      } else if (image.src.startsWith('images/')) {
        staticFileCount++;
        console.log('✅ 靜態檔案:', image.id, image.title, image.src, new Date(image.created_at).toLocaleString());
      } else {
        oldFormatCount++;
        console.log('❌ 舊格式(會被刪除):', image.id, image.title, srcPreview, new Date(image.created_at).toLocaleString());
      }
    });
    
    console.log('\n統計結果:');
    console.log('- Base64 格式:', base64Count, '張');
    console.log('- 靜態檔案:', staticFileCount, '張');  
    console.log('- 舊格式(會被刪除):', oldFormatCount, '張');
    
    if (oldFormatCount > 0) {
      console.log('\n⚠️  警告：有', oldFormatCount, '張圖片會被清理腳本刪除');
      console.log('請確認這些圖片是否為客戶重要資料');
    } else {
      console.log('\n✅ 所有圖片都是有效格式，清理腳本不會刪除任何圖片');
    }
    
  } catch (error) {
    console.error('檢查失敗:', error);
  } finally {
    await pool.end();
  }
}

checkGalleryImages(); 