// 管理員認證系統
let currentAdmin = null;

// 載入網站設定
async function loadSiteSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            
            // 更新側邊欄 logo
            const sidebarLogo = document.querySelector('.sidebar-logo');
            if (sidebarLogo && settings.site_logo) {
                sidebarLogo.src = settings.site_logo;
            }
            
            // 更新所有其他 logo
            const allLogos = document.querySelectorAll('img[alt*="小基基寵物犬舍"]');
            allLogos.forEach(logo => {
                if (settings.site_logo) {
                    logo.src = settings.site_logo;
                }
            });
            
            return settings;
        }
    } catch (error) {
        console.error('載入網站設定失敗:', error);
    }
    return null;
}

// 檢查是否已登入
function checkAuth() {
    const adminData = localStorage.getItem('adminData');
    const currentPage = window.location.pathname;
    
    if (!adminData && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (adminData) {
        currentAdmin = JSON.parse(adminData);
        // 載入網站設定
        loadSiteSettings();
        return true;
    }
    
    return false;
}

// 登入處理
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('button[type="submit"]');
        
        // 顯示載入狀態
        submitBtn.disabled = true;
        submitBtn.textContent = '登入中...';
        
        try {
            // 先嘗試 API 登入
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // 儲存管理員資料到 localStorage
                    localStorage.setItem('adminData', JSON.stringify(data.admin));
                    localStorage.setItem('adminLoggedIn', 'true');
                    currentAdmin = data.admin;
                    
                    // 跳轉到儀表板
                    window.location.href = 'dashboard.html';
                    return;
                }
            }
        } catch (error) {
            console.log('API 登入失敗，使用本地驗證:', error);
        }
        
        // 如果 API 登入失敗，使用本地驗證
        if (username === 'admin' && password === 'xiaojiji2024') {
            // 儲存管理員資料到 localStorage
            const adminData = {
                id: 1,
                username: 'admin',
                email: 'admin@xiaojiji.com',
                created_at: new Date().toISOString()
            };
            localStorage.setItem('adminData', JSON.stringify(adminData));
            localStorage.setItem('adminLoggedIn', 'true');
            currentAdmin = adminData;
            
            // 跳轉到儀表板
            window.location.href = 'dashboard.html';
        } else {
            alert('帳號或密碼錯誤');
        }
        
        // 恢復按鈕狀態
        submitBtn.disabled = false;
        submitBtn.textContent = '登入';
    });
}

// 獲取當前管理員資料
function getCurrentAdmin() {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
        return JSON.parse(adminData);
    }
    return null;
}

// 登出功能
function logout() {
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminLoggedIn');
    currentAdmin = null;
    window.location.href = 'login.html';
}

// 頁面載入時檢查認證
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 如果在管理頁面，顯示當前管理員資訊
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin/') && !currentPage.includes('login.html')) {
        const admin = getCurrentAdmin();
        if (admin) {
            // 更新頁面上的管理員資訊
            const adminInfo = document.querySelector('.admin-info');
            if (adminInfo) {
                adminInfo.textContent = `歡迎, ${admin.username}`;
            }
        }
    }
});