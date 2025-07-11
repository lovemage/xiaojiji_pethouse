-- 小基基寵物犬舍資料庫初始化腳本

-- 建立寵物表
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    birthdate DATE,
    age VARCHAR(50),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    color VARCHAR(100),
    category VARCHAR(20) CHECK (category IN ('small', 'medium', 'large')),
    price DECIMAL(10, 2),
    description TEXT,
    health TEXT,
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立客戶諮詢表
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    line_id VARCHAR(100),
    pet_size VARCHAR(20) CHECK (pet_size IN ('small', 'medium', 'large', 'undecided')),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立客戶評價表
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立網站設定表
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立管理員表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入預設寵物資料
INSERT INTO pets (name, breed, age, gender, color, category, price, description, health, images) VALUES
('小黑', '邊境牧羊犬', '3個月大', 'male', '黑白色', 'medium', 35000, '活潑聰明的邊境牧羊犬幼犬，已完成基礎訓練', '健康狀況良好，已接種疫苗', '["images/64805.jpg"]'),
('小花', '柯基犬', '2個月大', 'female', '三色', 'small', 38000, '可愛的柯基犬幼犬，性格溫順', '健康狀況良好，已接種疫苗', '["images/download.jpg"]'),
('露西', '黃金獵犬', '4個月大', 'female', '金色', 'large', 45000, '溫順的黃金獵犬幼犬，適合家庭飼養', '健康狀況良好，已接種疫苗', '["images/download-1.jpg"]'),
('小白', '柴犬', '4個月大', 'male', '白色', 'medium', 32000, '忠誠的柴犬幼犬，個性獨立', '健康狀況良好，已接種疫苗', '["images/download-2.jpg"]');

-- 插入預設客戶評價
INSERT INTO testimonials (name, pet_type, rating, text, avatar, is_active) VALUES
('陳小姐', '柯基犬主人', 5, '從小基基帶回家的柯基寶寶超級健康活潑！老闆很細心地教導飼養方式，還提供了完整的健康記錄。寶寶現在已經成為我們家的開心果了！', 'images/64805.jpg', TRUE),
('林先生', '黃金獵犬主人', 5, '專業的犬舍！環境乾淨整潔，狗狗們都很健康。最感動的是售後服務，老闆會定期關心狗狗的狀況，真的把每隻狗狗都當作家人。', 'images/download-1.jpg', TRUE),
('王小姐', '邊境牧羊犬主人', 5, '第二次來小基基購買狗狗了！品質真的沒話說，價格公道，最重要的是狗狗們都有完整的疫苗接種記錄。推薦給想要養狗的朋友們！', 'images/download.jpg', TRUE),
('張先生', '柴犬主人', 5, '老闆超有耐心！第一次養狗什麼都不懂，老闆詳細解說了飲食、訓練等各種注意事項。LINE隨時都可以諮詢，真的很貼心！', 'images/download-2.jpg', TRUE);

-- 插入預設網站設定
INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_title', '小基基寵物犬舍'),
('site_description', '專業邊境牧羊犬培育'),
('site_logo', 'images/logo.png'),
('contact_phone', '0910-808-283'),
('contact_line', '@corgidog'),
('contact_address', '高雄市鳳山區文龍東路666號'),
('business_hours', '下午13:00 ~ 晚上21:00'),
('license_number', '特寵業字第W1141071號'),
('tax_id', '00879221');

-- 插入預設管理員資料 (密碼: xiaojiji2024)
INSERT INTO admins (username, password, email, is_active) VALUES
('admin', 'xiaojiji2024', 'admin@xiaojiji.com', TRUE);

-- 建立索引以提升效能
CREATE INDEX IF NOT EXISTS idx_pets_category ON pets(category);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_is_read ON inquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active); 