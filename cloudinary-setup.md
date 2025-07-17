# Cloudinary 圖片存儲設置指南

## 📋 Cloudinary 帳號設置

### 1. 註冊Cloudinary帳號
1. 前往 [https://cloudinary.com](https://cloudinary.com)
2. 點擊「Sign Up」註冊免費帳號
3. 驗證郵箱完成註冊

### 2. 獲取API憑證
1. 登入Cloudinary控制台
2. 在Dashboard頁面找到「API Keys」區域
3. 記錄以下資訊：
   - **Cloud Name**: 你的云端名稱
   - **API Key**: API金鑰
   - **API Secret**: API密鑰（點擊眼睛圖標顯示）

## 🔧 環境變數設置

### 本地開發環境
在專案根目錄創建 `.env` 文件：

```env
# 數據庫配置
DATABASE_URL=postgresql://username:password@localhost:5432/pet_house

# 服務器配置
PORT=3000
NODE_ENV=development

# Cloudinary 配置
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

### Railway 生產環境
1. 登入Railway控制台
2. 進入您的專案
3. 點擊「Variables」頁籤
4. 添加以下環境變數：
   - `CLOUDINARY_CLOUD_NAME` = 你的cloud_name
   - `CLOUDINARY_API_KEY` = 你的api_key
   - `CLOUDINARY_API_SECRET` = 你的api_secret

## 🚀 執行遷移

### 1. 安裝依賴
```bash
npm install cloudinary
```

### 2. 執行圖片遷移
```bash
# 遷移所有圖片到Cloudinary
npm run migrate:cloudinary

# 或直接執行腳本
node scripts/migrate-to-cloudinary.js
```

### 3. 清理數據庫
```bash
# 遷移完成後，清理數據庫空間
railway connect Postgres -c "VACUUM FULL;"
```

## 📊 遷移效果預估

### 遷移前 (Base64存儲)
- 數據庫大小：~500MB-2GB
- 查詢速度：3-10秒
- 圖片加載：2-5秒

### 遷移後 (URL存儲)
- 數據庫大小：~10-50MB (減少90%+)
- 查詢速度：0.1-0.5秒 (提升10-20倍)
- 圖片加載：0.2-1秒 (CDN加速)

## 🎯 Cloudinary 免費額度
- **存儲空間**: 25GB
- **月流量**: 25GB
- **轉換次數**: 25,000次/月
- **API調用**: 1,000次/月

## ⚠️ 注意事項
1. **備份重要**: 遷移前請備份數據庫
2. **測試優先**: 先在測試環境執行
3. **分批遷移**: 大量圖片建議分批處理
4. **監控用量**: 注意Cloudinary使用量

## 🔍 遷移驗證
遷移完成後驗證：
1. 檢查圖片是否正常顯示
2. 確認數據庫大小減少
3. 測試圖片上傳功能
4. 檢查頁面加載速度 