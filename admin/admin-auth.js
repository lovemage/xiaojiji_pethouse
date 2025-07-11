// 管理員認證系統
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'xiaojiji2024'; // 實際使用時應該使用更安全的方式

// 檢查是否已登入
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// 登入處理
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert('帳號或密碼錯誤！');
        }
    });
}

// 登出功能
function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}

// 頁面載入時檢查認證
document.addEventListener('DOMContentLoaded', checkAuth);