const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAnnouncementsTable() {
  try {
    // Check if announcements table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'announcements'
      );
    `;
    
    const result = await pool.query(checkTableQuery);
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating announcements table...');
      
      // Create the announcements table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(50) CHECK (type IN ('general', 'promotion', 'notice', 'update')),
          is_active BOOLEAN DEFAULT TRUE,
          is_pinned BOOLEAN DEFAULT FALSE,
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
        CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned);
        CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
        CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
        
        -- Insert default announcements
        INSERT INTO announcements (title, content, type, is_active, is_pinned) VALUES
        ('歡迎來到小基基寵物犬舍', '我們提供專業的邊境牧羊犬培育服務，所有幼犬都經過健康檢查並完成基礎疫苗接種。', 'general', TRUE, TRUE),
        ('新年優惠活動', '即日起至月底，所有幼犬享有9折優惠，歡迎來店參觀選購！', 'promotion', TRUE, FALSE),
        ('營業時間調整', '配合政府防疫政策，營業時間調整為下午13:00至晚上21:00，造成不便敬請見諒。', 'notice', TRUE, FALSE),
        ('網站功能更新', '我們的網站新增了線上諮詢功能，您可以透過LINE或留言與我們聯繫。', 'update', TRUE, FALSE);
      `;
      
      await pool.query(createTableQuery);
      console.log('Announcements table created successfully!');
    } else {
      console.log('Announcements table already exists.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createAnnouncementsTable();