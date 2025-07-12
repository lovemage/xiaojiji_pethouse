const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixGallerySrcColumn() {
  try {
    console.log('開始修復 gallery_images 表的 src 欄位...');
    
    // 檢查目前的欄位類型
    const columnInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'gallery_images' AND column_name = 'src'
    `);
    
    if (columnInfo.rows.length > 0) {
      console.log('目前 src 欄位類型:', columnInfo.rows[0]);
    }
    
    // 修改欄位類型為 TEXT
    await pool.query('ALTER TABLE gallery_images ALTER COLUMN src TYPE TEXT');
    
    console.log('✅ 成功將 src 欄位類型改為 TEXT');
    
    // 再次檢查修改後的欄位類型
    const newColumnInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'gallery_images' AND column_name = 'src'
    `);
    
    if (newColumnInfo.rows.length > 0) {
      console.log('修改後 src 欄位類型:', newColumnInfo.rows[0]);
    }
    
    console.log('✅ 修復完成！現在可以儲存 Base64 圖片了');
    
  } catch (error) {
    console.error('修復失敗:', error);
  } finally {
    await pool.end();
  }
}

fixGallerySrcColumn(); 