require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// 顏色輸出函數
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`
};

async function testCloudinaryConnection() {
    console.log(colors.blue('🔍 檢查Cloudinary配置...'));
    
    // 檢查環境變數
    const requiredVars = {
        'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
        'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
        'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET
    };
    
    let missingVars = [];
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            missingVars.push(key);
        }
    }
    
    if (missingVars.length > 0) {
        console.log(colors.red('❌ 缺少以下環境變數:'));
        missingVars.forEach(varName => {
            console.log(colors.red(`   - ${varName}`));
        });
        console.log(colors.yellow('\n📋 請到Railway控制台設置以下變數:'));
        console.log('1. 登入 https://app.railway.app');
        console.log('2. 選擇您的專案');
        console.log('3. 點擊 "Variables" 頁籤');
        console.log('4. 添加以下變數:');
        missingVars.forEach(varName => {
            console.log(colors.yellow(`   ${varName}=您的值`));
        });
        return false;
    }
    
    // 配置Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    console.log(colors.green('✅ 環境變數配置完整'));
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 6)}...`);
    
    // 測試API連接
    try {
        console.log(colors.blue('\n🔗 測試Cloudinary API連接...'));
        const result = await cloudinary.api.ping();
        console.log(colors.green('✅ Cloudinary API連接成功!'));
        console.log(`   狀態: ${result.status}`);
        
        // 測試上傳權限
        console.log(colors.blue('\n🔑 測試上傳權限...'));
        
        // 創建一個小的測試圖片Buffer
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'pet-house/test',
                    resource_type: 'image',
                    public_id: 'connection-test-' + Date.now()
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(testImageBuffer);
        });
        
        console.log(colors.green('✅ 上傳測試成功!'));
        console.log(`   測試圖片URL: ${uploadResult.secure_url}`);
        
        // 刪除測試圖片
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log(colors.green('✅ 測試圖片已清理'));
        
        console.log(colors.green('\n🎉 Cloudinary配置完全正常，可以開始遷移!'));
        return true;
        
    } catch (error) {
        console.log(colors.red('❌ Cloudinary連接測試失敗:'));
        console.log(colors.red(`   錯誤: ${error.message}`));
        
        if (error.message.includes('Invalid API key')) {
            console.log(colors.yellow('\n💡 解決方案: 請檢查API Key是否正確'));
        } else if (error.message.includes('Invalid API secret')) {
            console.log(colors.yellow('\n💡 解決方案: 請檢查API Secret是否正確'));
        } else if (error.message.includes('cloud name')) {
            console.log(colors.yellow('\n💡 解決方案: 請檢查Cloud Name是否正確'));
        }
        
        return false;
    }
}

// 執行測試
testCloudinaryConnection()
    .then(success => {
        if (success) {
            console.log(colors.blue('\n🚀 準備就緒！執行以下命令開始遷移:'));
            console.log(colors.green('   npm run migrate:cloudinary'));
        } else {
            console.log(colors.red('\n⚠️  請修復上述問題後重新測試'));
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error(colors.red('測試過程發生錯誤:'), error);
        process.exit(1);
    }); 