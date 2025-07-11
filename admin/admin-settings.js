// 網站設定管理
let siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentSettings();
});

// 載入目前設定
function loadCurrentSettings() {
    // 載入橫幅圖片
    if (siteSettings.heroImage) {
        document.getElementById('currentHeroImage').src = siteSettings.heroImage;
    }
    
    // 載入公告設定
    if (siteSettings.announcement) {
        document.getElementById('announcementEnabled').checked = siteSettings.announcement.enabled;
        toggleAnnouncement();
        
        if (siteSettings.announcement.enabled) {
            document.getElementById('announcementType').value = siteSettings.announcement.type || 'info';
            document.getElementById('announcementTitle').value = siteSettings.announcement.title || '';
            document.getElementById('announcementContent').value = siteSettings.announcement.content || '';
            document.getElementById('announcementLink').value = siteSettings.announcement.link || '';
        }
    }
}

// 預覽橫幅圖片
function previewHeroImage() {
    const input = document.getElementById('newHeroImage');
    const preview = document.getElementById('heroImagePreview');
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            img.style.marginTop = '10px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 更新橫幅圖片
document.getElementById('heroForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const input = document.getElementById('newHeroImage');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            siteSettings.heroImage = e.target.result;
            localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
            
            alert('橫幅圖片已更新！');
            document.getElementById('currentHeroImage').src = e.target.result;
            input.value = '';
            document.getElementById('heroImagePreview').innerHTML = '';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        alert('請選擇要上傳的圖片！');
    }
});

// 切換公告顯示
function toggleAnnouncement() {
    const enabled = document.getElementById('announcementEnabled').checked;
    document.getElementById('announcementFields').style.display = enabled ? 'block' : 'none';
}

// 儲存公告設定
document.getElementById('announcementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    siteSettings.announcement = {
        enabled: document.getElementById('announcementEnabled').checked,
        type: document.getElementById('announcementType').value,
        title: document.getElementById('announcementTitle').value,
        content: document.getElementById('announcementContent').value,
        link: document.getElementById('announcementLink').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    alert('公告設定已儲存！');
});