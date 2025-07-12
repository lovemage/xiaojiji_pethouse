# Railway 部署指南

## 部署步驟

### 1. 準備工作
- 確保你有 Railway 帳號
- 安裝 Railway CLI（可選）

### 2. 在 Railway 上部署

1. 登入 [Railway](https://railway.app/)
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇你的專案儲存庫
5. Railway 會自動偵測 Node.js 專案

### 3. 設定環境變數

在 Railway 專案設定中，添加以下環境變數：

```
DATABASE_URL=<Railway 提供的 PostgreSQL 連接字串>
NODE_ENV=production
PORT=<Railway 自動設定>
```

### 4. 初始化資料庫

部署完成後，你需要初始化資料庫：

1. 在瀏覽器中訪問：`https://你的應用網址/api/health` 檢查資料庫連接
2. 訪問：`https://你的應用網址/api/init-database` 初始化資料庫表格和預設資料

### 5. 驗證部署

- 訪問 `https://你的應用網址/` 查看網站首頁
- 訪問 `https://你的應用網址/admin/login.html` 進入管理後台
- 預設管理員帳號：
  - 使用者名稱：admin
  - 密碼：xiaojiji2024

## 注意事項

1. **資料庫連接**：Railway 會自動提供 PostgreSQL 資料庫，確保 `DATABASE_URL` 環境變數正確設定
2. **檔案上傳**：目前使用本地檔案系統存儲上傳的圖片，在 Railway 上可能需要改用雲端存儲服務
3. **SSL 設定**：生產環境已配置使用 SSL 連接資料庫

## 故障排除

### 500 錯誤
- 檢查 `/api/health` 端點確認資料庫連接
- 確認是否已執行資料庫初始化
- 查看 Railway 的日誌輸出

### 資料庫連接失敗
- 確認 `DATABASE_URL` 環境變數已設定
- 檢查 SSL 設定是否正確

### API 路由錯誤
- 確認所有資料表都已建立（特別是 `announcements` 表）
- 使用 `/api/init-database` 重新初始化資料庫