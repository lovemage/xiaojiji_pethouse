// 網站設定管理
let siteSettings = {};

// 載入設定
async function loadSettings() {
    try {
        const settings = await API.getSettings();
        siteSettings = settings;
        loadCurrentSettings();
    } catch (error) {
        console.error('載入設定失敗:', error);
        // 如果 API 失敗，嘗試從 localStorage 載入
        siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        loadCurrentSettings();
    }
}

// 載入目前設定
function loadCurrentSettings() {
    // 載入橫幅圖片
    if (siteSettings.heroImage) {
        document.getElementById('currentHeroImage').src = siteSettings.heroImage;
    }
    
    // 載入公告設定
    if (siteSettings.announcement) {
        const announcement = typeof siteSettings.announcement === 'string' 
            ? JSON.parse(siteSettings.announcement) 
            : siteSettings.announcement;
            
        document.getElementById('announcementEnabled').checked = announcement.enabled || false;
        toggleAnnouncement();
        
        if (announcement.enabled) {
            document.getElementById('announcementType').value = announcement.type || 'info';
            document.getElementById('announcementTitle').value = announcement.title || '';
            document.getElementById('announcementContent').value = announcement.content || '';
            document.getElementById('announcementLink').value = announcement.link || '';
        }
    }
}

// 預覽橫幅圖片
function previewHeroImage() {
    const file = document.getElementById('newHeroImage').files[0];
    const preview = document.getElementById('heroImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="預覽圖片" style="max-width: 100%; max-height: 200px; border-radius: 5px;">`;
        }
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 上傳橫幅圖片
document.getElementById('heroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('newHeroImage');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('請選擇要上傳的圖片');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('heroImage', file);
        
        // 這裡需要實現圖片上傳 API
        // const response = await API.uploadHeroImage(formData);
        
        // 暫時使用 localStorage
        const reader = new FileReader();
        reader.onload = async function(e) {
            await API.updateSetting('heroImage', e.target.result);
            siteSettings.heroImage = e.target.result;
            document.getElementById('currentHeroImage').src = e.target.result;
            alert('橫幅圖片已更新！');
        }
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('上傳失敗:', error);
        alert('上傳失敗，請稍後再試');
    }
});

// 切換公告顯示
function toggleAnnouncement() {
    const enabled = document.getElementById('announcementEnabled').checked;
    document.getElementById('announcementFields').style.display = enabled ? 'block' : 'none';
}

// 儲存公告設定
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const announcementData = {
        enabled: document.getElementById('announcementEnabled').checked,
        type: document.getElementById('announcementType').value,
        title: document.getElementById('announcementTitle').value,
        content: document.getElementById('announcementContent').value,
        link: document.getElementById('announcementLink').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await API.updateSetting('announcement', JSON.stringify(announcementData));
        siteSettings.announcement = announcementData;
        alert('公告設定已儲存！');
    } catch (error) {
        console.error('儲存失敗:', error);
        // 如果 API 失敗，使用 localStorage 作為備份
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
        alert('公告設定已儲存（本地儲存）！');
    }
});

// 頁面載入時載入設定
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});