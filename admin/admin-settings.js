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
    
    // 載入 Hero 文字設定
    if (siteSettings.heroText) {
        const heroText = typeof siteSettings.heroText === 'string' 
            ? JSON.parse(siteSettings.heroText) 
            : siteSettings.heroText;
            
        document.getElementById('heroTitle').value = heroText.title || '歡迎來到小基基寵物犬舍';
        document.getElementById('heroSubtitle1').value = heroText.subtitle1 || '提供健康、聰明、可愛的寵物犬';
        document.getElementById('heroSubtitle2').value = heroText.subtitle2 || '擁有政府特寵業執照，品質保證';
    } else {
        // 設定預設值
        document.getElementById('heroTitle').value = '歡迎來到小基基寵物犬舍';
        document.getElementById('heroSubtitle1').value = '提供健康、聰明、可愛的寵物犬';
        document.getElementById('heroSubtitle2').value = '擁有政府特寵業執照，品質保證';
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

    // 載入導航設定
    if (siteSettings.navigation) {
        const navigation = typeof siteSettings.navigation === 'string'
            ? JSON.parse(siteSettings.navigation)
            : siteSettings.navigation;

        document.getElementById('galleryNavToggle').checked = navigation.showGallery || false;
        updateGalleryNavStatus();
    } else {
        // 預設為關閉
        document.getElementById('galleryNavToggle').checked = false;
        updateGalleryNavStatus();
    }
}

// 預覽橫幅圖片
function previewHeroImage() {
    const file = document.getElementById('newHeroImage').files[0];
    const preview = document.getElementById('heroImagePreview');
    
    if (file) {
        // 檢查檔案大小（2MB = 2 * 1024 * 1024 bytes）
        if (file.size > 2 * 1024 * 1024) {
            preview.innerHTML = `<div style="color: red; margin: 10px 0;">檔案 "${file.name}" 超過2MB限制，請選擇較小的圖片</div>`;
            document.getElementById('newHeroImage').value = ''; // 清除檔案選擇
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="預覽圖片" style="max-width: 100%; max-height: 200px; border-radius: 5px;">`;
        }
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 儲存 Hero 文字設定
document.getElementById('heroTextForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const heroTextData = {
        title: document.getElementById('heroTitle').value,
        subtitle1: document.getElementById('heroSubtitle1').value,
        subtitle2: document.getElementById('heroSubtitle2').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await API.updateSetting('heroText', JSON.stringify(heroTextData));
        siteSettings.heroText = heroTextData;
        alert('橫幅文字已更新！');
    } catch (error) {
        console.error('儲存失敗:', error);
        // 如果 API 失敗，使用 localStorage 作為備份
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
        alert('橫幅文字已更新（本地儲存）！');
    }
});

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

// 更新寶貝相簿導航狀態顯示
function updateGalleryNavStatus() {
    const toggle = document.getElementById('galleryNavToggle');
    const status = document.getElementById('galleryNavStatus');
    status.textContent = toggle.checked ? '開啟' : '關閉';
}

// 寶貝相簿導航開關事件
document.getElementById('galleryNavToggle').addEventListener('change', updateGalleryNavStatus);

// 導航設定表單提交
document.getElementById('navigationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const navigationData = {
        showGallery: document.getElementById('galleryNavToggle').checked,
        updatedAt: new Date().toISOString()
    };

    try {
        await API.updateSetting('navigation', JSON.stringify(navigationData));
        siteSettings.navigation = navigationData;
        alert('導航設定已儲存！');

        // 通知前端更新導航
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'navigationUpdated',
                data: navigationData
            }, '*');
        }
    } catch (error) {
        console.error('儲存失敗:', error);
        // 如果 API 失敗，使用 localStorage 作為備份
        siteSettings.navigation = navigationData;
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
        alert('導航設定已儲存（本地儲存）！');
    }
});

// 頁面載入時載入設定
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});