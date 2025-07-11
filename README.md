# 小基基寵物犬舍網站

專業邊境牧羊犬培育網站，包含完整的前端展示和管理後台系統。

## 專案特色

- 🐕 專業寵物犬舍展示網站
- 📱 響應式設計，支援手機和桌面
- 🔐 隱藏式管理員入口（Logo 連續點擊 5 次）
- 🗃️ 完整的寵物管理系統
- 📧 客戶諮詢管理
- ⭐ 客戶評價系統
- 🖼️ 圖片上傳功能
- 🎨 美觀的管理後台界面

## 技術架構

### 前端
- HTML5 + CSS3 + JavaScript
- 響應式設計
- Font Awesome 圖標

### 後端
- Node.js + Express
- PostgreSQL 資料庫
- Multer 圖片上傳
- CORS 支援

### 部署
- Railway.app 雲端部署
- 自動 HTTPS 和 CDN
- PostgreSQL 雲端資料庫

## Railway 部署指南

### 1. 準備 Railway 帳號
1. 前往 [Railway.app](https://railway.app) 註冊帳號
2. 連接您的 GitHub 帳號

### 2. 建立新專案
1. 在 Railway 控制台點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 選擇您的 `pet_house` 倉庫

### 3. 添加 PostgreSQL 資料庫
1. 在專案中點擊 "New" → "Database" → "Add PostgreSQL"
2. Railway 會自動建立資料庫並設定 `DATABASE_URL` 環境變數

### 4. 初始化資料庫
1. 在 Railway 控制台中找到 PostgreSQL 服務
2. 點擊 "Connect" → "Query"
3. 複製 `database/init.sql` 的內容並執行

### 5. 設定環境變數
Railway 會自動設定以下環境變數：
- `DATABASE_URL` - PostgreSQL 連接字串
- `PORT` - 應用程式端口
- `NODE_ENV=production`

### 6. 部署完成
- Railway 會自動建置和部署您的應用程式
- 部署完成後會提供一個 `.railway.app` 的網址

## 本地開發

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定環境變數
複製 `env.example` 為 `.env` 並填入您的資料庫連接資訊：
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pet_house
PORT=3000
NODE_ENV=development
```

### 3. 初始化資料庫
```bash
# 在 PostgreSQL 中執行
psql -U username -d pet_house -f database/init.sql
```

### 4. 啟動開發伺服器
```bash
npm run dev
```

### 5. 開啟瀏覽器
前往 `http://localhost:3000`

## 功能說明

### 前端功能
- 首頁展示
- 寵物展示（分類篩選）
- 健康資訊頁面
- 領養指南
- 客戶評價
- 聯絡表單

### 管理後台功能
- 儀表板（統計資訊）
- 寵物管理（新增、編輯、刪除）
- 客戶諮詢管理
- 客戶評價管理
- 網站設定

### 隱藏管理員入口
在首頁 Logo 上 3 秒內連續點擊 5 次即可進入管理系統。

## 資料庫結構

### pets 表
- 寵物基本資訊
- 圖片儲存（JSON 格式）
- 價格、描述、健康資訊

### inquiries 表
- 客戶諮詢資訊
- 聯絡方式
- 已讀狀態

### testimonials 表
- 客戶評價
- 星級評分
- 顯示狀態

### site_settings 表
- 網站設定
- 聯絡資訊
- 營業時間

## 部署檢查清單

- [ ] GitHub 倉庫已建立
- [ ] Railway 專案已建立
- [ ] PostgreSQL 資料庫已添加
- [ ] 資料庫已初始化（執行 init.sql）
- [ ] 環境變數已設定
- [ ] 應用程式已成功部署
- [ ] 網站可正常訪問
- [ ] 管理後台可正常使用
- [ ] 圖片上傳功能正常

## 聯絡資訊

- 電話：0910-808-283
- LINE：@corgidog
- 地址：高雄市鳳山區文龍東路666號
- 營業時間：下午13:00 ~ 晚上21:00

## 授權

© 2024 小基基寵物犬舍. All rights reserved. 