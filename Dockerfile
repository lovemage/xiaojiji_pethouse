# 使用官方 Node.js 鏡像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案檔案
COPY . .

# 建立上傳目錄
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "start"] 