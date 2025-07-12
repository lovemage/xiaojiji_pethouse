const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 資料庫連接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 中介軟體
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加請求大小限制以支援 Base64 圖片
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態檔案服務
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 圖片上傳設定 - 改為記憶體存儲
const storage = multer.memoryStorage(); // 使用記憶體存儲而非磁碟

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'), false);
    }
  }
});

// 將圖片轉換為 Base64 的輔助函數
function imageToBase64(file) {
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

// API 路由

// 資料庫連接測試
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('資料庫連接錯誤:', err);
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// 寵物相關 API
app.get('/api/pets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('獲取寵物資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/pets', upload.array('images', 5), async (req, res) => {
  try {
    const { name, breed, birthdate, age, gender, color, category, price, description, health } = req.body;
    
    // 處理上傳的圖片
    const images = req.files ? req.files.map(file => imageToBase64(file)) : [];
    
    const result = await pool.query(
      `INSERT INTO pets (name, breed, birthdate, age, gender, color, category, price, description, health, images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, breed, birthdate, age, gender, color, category, price, description, health, JSON.stringify(images)]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('新增寵物錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/pets/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, breed, birthdate, age, gender, color, category, price, description, health } = req.body;
    
    // 處理上傳的圖片
    let updateQuery = `UPDATE pets SET name = $1, breed = $2, birthdate = $3, age = $4, gender = $5, 
       color = $6, category = $7, price = $8, description = $9, health = $10, 
                       updated_at = CURRENT_TIMESTAMP`;
    let params = [name, breed, birthdate, age, gender, color, category, price, description, health];
    
    // 如果有新上傳的圖片，更新圖片欄位
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => imageToBase64(file));
      updateQuery += `, images = $11 WHERE id = $12 RETURNING *`;
      params.push(JSON.stringify(images), id);
    } else {
      updateQuery += ` WHERE id = $11 RETURNING *`;
      params.push(id);
    }
    
    const result = await pool.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '寵物不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新寵物錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pets WHERE id = $1', [id]);
    res.json({ message: '寵物資料已刪除' });
  } catch (err) {
    console.error('刪除寵物錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 客戶諮詢相關 API
app.get('/api/inquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('獲取諮詢資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, phone, lineId, petSize, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO inquiries (name, phone, line_id, pet_size, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phone, lineId, petSize, message]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('新增諮詢錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    
    const result = await pool.query(
      'UPDATE inquiries SET is_read = $1 WHERE id = $2 RETURNING *',
      [is_read, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '訊息不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新訊息錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/inquiries/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE inquiries SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('標記已讀錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
    res.json({ message: '諮詢資料已刪除' });
  } catch (err) {
    console.error('刪除諮詢錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 客戶評價相關 API
app.get('/api/testimonials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('獲取評價資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, petType, rating, text, avatar } = req.body;
    
    const result = await pool.query(
      'INSERT INTO testimonials (name, pet_type, rating, text, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, petType, rating, text, avatar]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('新增評價錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, petType, rating, text, avatar, isActive } = req.body;
    
    const result = await pool.query(
      `UPDATE testimonials SET name = $1, pet_type = $2, rating = $3, text = $4, 
       avatar = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [name, petType, rating, text, avatar, isActive, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新評價錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
    res.json({ message: '評價已刪除' });
  } catch (err) {
    console.error('刪除評價錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 網站設定相關 API
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error('獲取設定錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    const result = await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES ($1, $2) 
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [key, value]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新設定錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 相簿相關 API
app.get('/api/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery_images WHERE is_active = true';
    let params = [];
    
    if (category && category !== 'all') {
      query += ' AND category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY sort_order ASC, created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('獲取相簿資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/gallery', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, sortOrder } = req.body;
    
    // 處理上傳的圖片
    const src = req.file ? imageToBase64(req.file) : req.body.src;
    
    const result = await pool.query(
      'INSERT INTO gallery_images (title, description, src, category, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, src, category, sortOrder || 0]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('新增相簿圖片錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/gallery/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, sortOrder, isActive } = req.body;
    
    // 如果有新上傳的圖片，使用新圖片，否則保持原圖片
    let updateQuery = `UPDATE gallery_images SET title = $1, description = $2, category = $3, 
                       sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP`;
    let params = [title, description, category, sortOrder || 0, isActive !== undefined ? isActive : true];
    
    if (req.file) {
      updateQuery += `, src = $6 WHERE id = $7 RETURNING *`;
      params.push(imageToBase64(req.file), id);
    } else {
      updateQuery += ` WHERE id = $6 RETURNING *`;
      params.push(id);
    }
    
    const result = await pool.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '圖片不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新相簿圖片錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM gallery_images WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '圖片不存在' });
    }
    
    res.json({ message: '相簿圖片已刪除' });
  } catch (err) {
    console.error('刪除相簿圖片錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 公告相關 API
app.get('/api/announcements', async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM announcements';
    let params = [];
    
    if (active === 'true') {
      query += ' WHERE is_active = true AND (start_date IS NULL OR start_date <= CURRENT_DATE) AND (end_date IS NULL OR end_date >= CURRENT_DATE)';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('獲取公告資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, type, startDate, endDate } = req.body;
    
    const result = await pool.query(
      'INSERT INTO announcements (title, content, type, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, type || 'info', startDate || null, endDate || null]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('新增公告錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, startDate, endDate, isActive } = req.body;
    
    const result = await pool.query(
      `UPDATE announcements SET title = $1, content = $2, type = $3, start_date = $4, 
       end_date = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [title, content, type, startDate || null, endDate || null, isActive, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新公告錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '公告不存在' });
    }
    
    res.json({ message: '公告已刪除' });
  } catch (err) {
    console.error('刪除公告錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 管理員相關 API
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND password = $2 AND is_active = true',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        success: true, 
        message: '登入成功',
        admin: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email
        }
      });
    } else {
      res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }
  } catch (err) {
    console.error('管理員登入錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 資料庫初始化端點 (僅供開發和部署使用)
app.get('/api/init-database', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // 讀取初始化腳本
    const initSqlPath = path.join(__dirname, 'database', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // 執行初始化腳本
    await pool.query(initSql);
    
    res.json({ 
      success: true, 
      message: '資料庫初始化成功' 
    });
  } catch (err) {
    console.error('資料庫初始化錯誤:', err);
    res.status(500).json({ 
      error: '資料庫初始化失敗',
      details: err.message 
    });
  }
});

app.get('/api/admin/profile', async (req, res) => {
  try {
    const { username } = req.query;
    
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM admins WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: '管理員不存在' });
    }
  } catch (err) {
    console.error('獲取管理員資料錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

app.put('/api/admin/password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    // 驗證當前密碼
    const authResult = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND password = $2 AND is_active = true',
      [username, currentPassword]
    );
    
    if (authResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: '當前密碼錯誤' });
    }
    
    // 更新密碼
    const result = await pool.query(
      'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2 RETURNING id, username, email',
      [newPassword, username]
    );
    
    res.json({ 
      success: true, 
      message: '密碼更新成功',
      admin: result.rows[0]
    });
  } catch (err) {
    console.error('更新密碼錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 首頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 其他頁面路由
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉伺服器...');
  pool.end(() => {
    console.log('資料庫連接已關閉');
    process.exit(0);
  });
}); 