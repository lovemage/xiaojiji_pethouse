const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
const { uploadToCloudinary } = require('./config/cloudinary-enhanced');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 資料庫連接
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 中介軟體
app.use(cors());
app.use(express.json({ limit: '5mb' })); // 增加請求大小限制以支援 Base64 圖片
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 靜態檔案服務
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 錯誤處理中間件 - 處理檔案上傳錯誤
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '檔案大小超過限制，請上傳小於2MB的圖片' });
    }
    return res.status(400).json({ error: '檔案上傳錯誤：' + err.message });
  }
  if (err.message === '只允許上傳圖片檔案') {
    return res.status(400).json({ error: '只允許上傳圖片檔案' });
  }
  next(err);
});

// 圖片上傳設定 - 改為記憶體存儲
const storage = multer.memoryStorage(); // 使用記憶體存儲而非磁碟

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳 PNG 格式圖片檔案'), false);
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

// 模擬寵物數據
const mockPets = [
  {
    id: 1,
    name: '小黑',
    breed: '邊境牧羊犬',
    age: '3個月大',
    gender: 'male',
    color: '黑白色',
    category: 'large',
    price: 35000,
    description: '活潑聰明的邊境牧羊犬幼犬',
    health: '已完成疫苗接種',
    images: '["images/64805.jpg"]'
  },
  {
    id: 2,
    name: '小花',
    breed: '柯基犬',
    age: '2個月大',
    gender: 'female',
    color: '三色',
    category: 'medium',
    price: 38000,
    description: '可愛的柯基犬幼犬',
    health: '健康檢查良好',
    images: '["images/download.jpg"]'
  },
  {
    id: 3,
    name: '露西',
    breed: '黃金獵犬',
    age: '4個月大',
    gender: 'female',
    color: '金黃色',
    category: 'large',
    price: 45000,
    description: '溫順友善的黃金獵犬',
    health: '完整疫苗記錄',
    images: '["images/download-1.jpg"]'
  },
  {
    id: 4,
    name: '小白',
    breed: '柴犬',
    age: '4個月大',
    gender: 'male',
    color: '白色',
    category: 'medium',
    price: 32000,
    description: '聰明活潑的柴犬',
    health: '健康狀況優良',
    images: '["images/download-2.jpg"]'
  },
  {
    id: 5,
    name: '貝貝',
    breed: '博美犬',
    age: '2個月大',
    gender: 'female',
    color: '橘色',
    category: 'small',
    price: 28000,
    description: '小巧可愛的博美犬',
    health: '基礎疫苗完成',
    images: '["images/64805.jpg"]'
  },
  {
    id: 6,
    name: '哈士奇',
    breed: '哈士奇',
    age: '3個月大',
    gender: 'male',
    color: '黑白色',
    category: 'large',
    price: 42000,
    description: '活力充沛的哈士奇',
    health: '健康檢查通過',
    images: '["images/64805.jpg"]'
  }
];

// 寵物相關 API
app.get('/api/pets', async (req, res) => {
  try {
    const { category, breed } = req.query;
    
    let query = 'SELECT * FROM pets WHERE 1=1';
    let params = [];
    
    // 添加分類篩選
    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    // 添加品種篩選
    if (breed) {
      query += ' AND breed = $' + (params.length + 1);
      params.push(breed);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('獲取寵物資料錯誤:', err);
    // 數據庫連接失敗時返回模擬數據
    res.json(mockPets);
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

// 複製寵物
app.post('/api/pets/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('複製寵物 ID:', id);

    // 先獲取原始寵物資料
    console.log('執行查詢: SELECT * FROM pets WHERE id = $1', [id]);
    const result = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '找不到指定的寵物' });
    }

    const originalPet = result.rows[0];

    // 創建複製的寵物資料（保持原名稱）
    // 處理 JSONB 字段
    let imagesData = originalPet.images;
    if (typeof imagesData === 'string') {
      try {
        imagesData = JSON.parse(imagesData);
      } catch (e) {
        console.log('Images 解析錯誤，使用原始值:', imagesData);
      }
    }

    // 複製所有資料，包括描述
    const insertResult = await pool.query(`
      INSERT INTO pets (name, breed, birthdate, age, gender, color, category, price, description, health, images, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      originalPet.name,
      originalPet.breed,
      originalPet.birthdate || null,  // 包含 birthdate 欄位
      originalPet.age,
      originalPet.gender,
      originalPet.color,
      originalPet.category,
      originalPet.price,
      originalPet.description || '',  // 複製原始描述
      originalPet.health,
      JSON.stringify(imagesData) // 確保是 JSON 字符串
    ]);

    console.log('寵物複製成功:', originalPet.name);
    res.json({
      success: true,
      pet: insertResult.rows[0],
      message: `寵物 "${originalPet.name}" 複製成功！`
    });
  } catch (err) {
    console.error('複製寵物錯誤:', err);
    console.error('錯誤詳情:', err.message);
    console.error('錯誤堆疊:', err.stack);
    
    // 提供更詳細的錯誤訊息
    let errorMessage = '複製寵物失敗';
    if (err.code === '42703') {
      errorMessage = '資料庫欄位錯誤，請聯絡系統管理員';
    } else if (err.code === '23505') {
      errorMessage = '複製失敗：資料重複';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    // 數據庫連接失敗時返回模擬數據
    res.json(mockTestimonials);
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
// 模擬設定數據
const mockSettings = {
  site_title: '小基基寵物犬舍',
  site_description: '專業寵物犬舍',
  contact_phone: '0910-808-283',
  contact_line: '@corgidog',
  business_hours: '下午13:00 ~ 晚上21:00',
  contact_address: '台灣',
  license_number: '特寵業字第A12345號',
  tax_id: '12345678',
  show_gallery_nav: true,
  // 預設 hero 圖片
  heroImage: 'images/pkncb1-golden-retriever-puppy-running-outdoors-in-grass.webp',
  // 寵物卡片顯示設定 - 預設只顯示品種和毛色
  show_name: false,
  show_breed: true,
  show_description: false,
  show_age: false,
  show_gender: false,
  show_price: false,
  show_health: false,
  show_color: true
};

// 模擬客戶評價數據
const mockTestimonials = [
  {
    id: 1,
    name: '王小明',
    pet_type: '黃金獵犬',
    rating: 5,
    text: '非常滿意！小狗很健康，老闆很專業，會持續關心小狗的狀況。',
    avatar: null,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: '李美華',
    pet_type: '柴犬',
    rating: 5,
    text: '服務很好，小狗很可愛，已經養了半年了，很健康活潑！',
    avatar: null,
    created_at: '2024-01-10T14:20:00Z'
  },
  {
    id: 3,
    name: '張大偉',
    pet_type: '貴賓犬',
    rating: 4,
    text: '品質不錯，價格合理，推薦給想養寵物的朋友。',
    avatar: null,
    created_at: '2024-01-05T16:45:00Z'
  }
];

// 模擬公告數據
const mockAnnouncements = [
  {
    id: 1,
    title: '新年優惠活動',
    content: '農曆新年期間，所有幼犬享有9折優惠！',
    type: 'promotion',
    is_active: true,
    link: null,
    created_at: '2024-01-01T00:00:00Z'
  }
];

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
    // 數據庫連接失敗時返回模擬數據
    res.json(mockSettings);
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;

  try {
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

    // 數據庫連接失敗時更新模擬數據
    if (mockSettings.hasOwnProperty(key)) {
      mockSettings[key] = value;
      res.json({ setting_key: key, setting_value: value });
    } else {
      res.status(500).json({ error: '設定項目不存在' });
    }
  }
});

// Hero 圖片上傳 API
app.post('/api/upload-hero-image', upload.single('heroImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有選擇檔案' });
    }

    console.log('開始上傳 Hero 圖片...');
    
    // 檢查檔案大小 (2MB 限制)
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: '檔案大小超過2MB限制' });
    }
    
    let imageUrl;
    
    // 如果有Cloudinary配置，使用CDN上傳
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'hero-images');
        imageUrl = uploadResult.secure_url;
        console.log('Hero 圖片上傳到 Cloudinary 成功:', imageUrl);
      } catch (cloudinaryError) {
        console.log('Cloudinary 上傳失敗，使用 Base64 儲存:', cloudinaryError.message);
        imageUrl = imageToBase64(req.file);
      }
    } else {
      // 沒有Cloudinary配置時使用Base64儲存
      console.log('使用 Base64 儲存 Hero 圖片');
      imageUrl = imageToBase64(req.file);
    }
    
    // 更新資料庫設定
    const result = await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES ($1, $2)
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      ['heroImage', imageUrl]
    );

    console.log('Hero 圖片設定已更新到資料庫');

    res.json({
      success: true,
      imageUrl: imageUrl,
      setting: result.rows[0]
    });
    
  } catch (error) {
    console.error('Hero 圖片上傳失敗:', error);
    res.status(500).json({ error: '圖片上傳失敗: ' + error.message });
  }
});

// 安全修復顯示設定的 API 端點（僅修復顯示設定，不影響客戶數據）
app.post('/api/fix-display-settings', async (req, res) => {
  try {
    console.log('開始修復顯示設定...');

    // 使用 UPSERT 語法，安全地更新或插入顯示設定
    const displaySettings = [
      ['show_name', false],
      ['show_breed', true],
      ['show_description', false],
      ['show_age', false],
      ['show_gender', false],
      ['show_price', false],
      ['show_health', false],
      ['show_color', true]
    ];

    for (const [key, value] of displaySettings) {
      await pool.query(`
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES ($1, $2)
        ON CONFLICT (setting_key)
        DO UPDATE SET setting_value = $2
      `, [key, value]);
    }

    console.log('顯示設定修復完成');
    res.json({
      success: true,
      message: '顯示設定已修復為預設值（品種和毛色開啟），客戶數據未受影響'
    });
  } catch (error) {
    console.error('修復顯示設定失敗:', error);

    // 數據庫連接失敗時更新模擬數據
    mockSettings.show_name = false;
    mockSettings.show_breed = true;
    mockSettings.show_description = false;
    mockSettings.show_age = false;
    mockSettings.show_gender = false;
    mockSettings.show_price = false;
    mockSettings.show_health = false;
    mockSettings.show_color = true;

    res.json({
      success: true,
      message: '顯示設定已修復為預設值（使用模擬數據），客戶數據未受影響'
    });
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
    
    console.log('更新相簿圖片請求:', { id, title, description, category, sortOrder, isActive });
    console.log('是否有新圖片:', !!req.file);
    console.log('req.body:', req.body);
    
    // 驗證必要參數
    if (!title || !description || !category) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    // 處理參數
    const processedSortOrder = parseInt(sortOrder) || 0;
    const processedIsActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : true;
    
    // 如果有新上傳的圖片，使用新圖片，否則保持原圖片
    let updateQuery = `UPDATE gallery_images SET title = $1, description = $2, category = $3, 
                       sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP`;
    let params = [title, description, category, processedSortOrder, processedIsActive];
    
    if (req.file) {
      updateQuery += `, src = $6 WHERE id = $7 RETURNING *`;
      params.push(imageToBase64(req.file), id);
    } else {
      updateQuery += ` WHERE id = $6 RETURNING *`;
      params.push(id);
    }
    
    console.log('執行 SQL 查詢:', updateQuery);
    console.log('參數:', params.map((p, i) => i === 5 && typeof p === 'string' && p.startsWith('data:') ? '[Base64 圖片]' : p));
    
    const result = await pool.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '圖片不存在' });
    }
    
    console.log('更新成功:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新相簿圖片錯誤:', err);
    console.error('錯誤堆疊:', err.stack);
    res.status(500).json({ error: '伺服器錯誤', details: err.message });
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
  const { active } = req.query;

  try {
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
    // 數據庫連接失敗時返回模擬數據
    let announcements = [...mockAnnouncements];
    if (active === 'true') {
      announcements = announcements.filter(a => a.is_active);
    }
    res.json(announcements);
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

// 檢查相簿圖片格式端點
app.get('/api/check-gallery', async (req, res) => {
  try {
    // 查詢所有相簿圖片
    const result = await pool.query('SELECT id, title, src, created_at FROM gallery_images ORDER BY created_at DESC');
    
    let base64Count = 0;
    let staticFileCount = 0;
    let oldFormatCount = 0;
    let images = [];
    
    result.rows.forEach(image => {
      const srcPreview = image.src.length > 50 ? image.src.substring(0, 50) + '...' : image.src;
      let type = '';
      
      if (image.src.startsWith('data:')) {
        base64Count++;
        type = 'Base64';
      } else if (image.src.startsWith('images/')) {
        staticFileCount++;
        type = '靜態檔案';
      } else {
        // 檢查是否為舊格式
        const isOldUploadFile = !image.src.startsWith('data:') && 
                               !image.src.startsWith('images/') && 
                               !image.src.startsWith('uploads/') &&
                               /\.(jpg|jpeg|png|gif|webp)$/i.test(image.src);
        if (isOldUploadFile) {
          oldFormatCount++;
          type = '舊格式(會被刪除)';
        } else {
          type = '其他格式';
        }
      }
      
      images.push({
        id: image.id,
        title: image.title,
        src: srcPreview,
        type: type,
        created_at: image.created_at
      });
    });
    
    res.json({
      success: true,
      total: result.rows.length,
      statistics: {
        base64: base64Count,
        staticFile: staticFileCount,
        oldFormat: oldFormatCount
      },
      images: images,
      warning: oldFormatCount > 0 ? `有 ${oldFormatCount} 張圖片會被清理腳本刪除` : null
    });
    
  } catch (err) {
    console.error('檢查相簿圖片錯誤:', err);
    res.status(500).json({ 
      error: '檢查失敗',
      details: err.message 
    });
  }
});

// 修復 gallery_images 表的 src 欄位類型
app.get('/api/fix-gallery-column', async (req, res) => {
  try {
    console.log('開始修復 gallery_images 表的 src 欄位...');
    
    // 檢查目前的欄位類型
    const columnInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'gallery_images' AND column_name = 'src'
    `);
    
    let currentType = 'unknown';
    if (columnInfo.rows.length > 0) {
      currentType = columnInfo.rows[0].data_type;
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
    
    let newType = 'unknown';
    if (newColumnInfo.rows.length > 0) {
      newType = newColumnInfo.rows[0].data_type;
      console.log('修改後 src 欄位類型:', newColumnInfo.rows[0]);
    }
    
    res.json({
      success: true,
      message: '修復完成！現在可以儲存 Base64 圖片了',
      before: currentType,
      after: newType
    });
    
  } catch (err) {
    console.error('修復 gallery_images 表錯誤:', err);
    res.status(500).json({ 
      error: '修復失敗',
      details: err.message 
    });
  }
});

// 清理舊格式相簿圖片端點
app.get('/api/clean-gallery', async (req, res) => {
  try {
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
    
    res.json({ 
      success: true, 
      message: `清理完成，共刪除 ${deletedCount} 張舊格式圖片`,
      remaining: remainingResult.rows.length,
      deleted: deletedCount
    });
  } catch (err) {
    console.error('清理舊格式圖片錯誤:', err);
    res.status(500).json({ 
      error: '清理失敗',
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