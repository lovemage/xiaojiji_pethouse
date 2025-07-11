const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAndCreateGalleryTable() {
  try {
    // Check if gallery_images table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gallery_images'
      );
    `;
    
    const result = await pool.query(checkTableQuery);
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating gallery_images table...');
      
      // Create the gallery_images table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS gallery_images (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          src VARCHAR(500) NOT NULL,
          category VARCHAR(50) CHECK (category IN ('puppy', 'adult', 'training', 'daily')),
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
        CREATE INDEX IF NOT EXISTS idx_gallery_images_is_active ON gallery_images(is_active);
        CREATE INDEX IF NOT EXISTS idx_gallery_images_sort_order ON gallery_images(sort_order);
        CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at);
        
        -- Insert default gallery images
        INSERT INTO gallery_images (title, description, src, category, sort_order) VALUES
        ('邊境牧羊犬幼犬', '健康活潑的邊境牧羊犬幼犬，3個月大', 'images/64805.jpg', 'puppy', 1),
        ('柯基犬幼犬', '萌萌的柯基犬幼犬，2個月大', 'images/download.jpg', 'puppy', 2),
        ('黃金獵犬', '溫順友善的黃金獵犬成犬', 'images/download-1.jpg', 'adult', 3),
        ('柴犬', '聰明活潑的柴犬成犬', 'images/download-2.jpg', 'adult', 4),
        ('犬舍環境', '乾淨整潔的犬舍環境，給狗狗最好的生活空間', 'images/RnWoowUwUaWbUjTraVyj-6FYMm_TH-eUtdIZk7XSGZM.jpg', 'daily', 5),
        ('戶外訓練', '狗狗在戶外草地上快樂奔跑的訓練時光', 'images/pkncb1-golden-retriever-puppy-running-outdoors-in-grass.png', 'training', 6),
        ('健康檢查', '定期的健康檢查，確保每隻狗狗都健康', 'images/Pets-Health.jpg', 'puppy', 7),
        ('日常照護', '專業的日常照護，讓狗狗健康成長', 'images/pets-Health2.jpg', 'daily', 8);
      `;
      
      await pool.query(createTableQuery);
      console.log('Gallery table created successfully!');
    } else {
      console.log('Gallery table already exists.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateGalleryTable();