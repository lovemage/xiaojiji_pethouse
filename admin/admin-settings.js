// 網站設定管理
let siteSettings = {};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentSettings();
});

// 載入目前設定
async function loadCurrentSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            siteSettings = await response.json();
            
            // 載入 logo
            if (siteSettings.site_logo) {
                document.getElementById('currentLogo').src = siteSettings.site_logo;
            }
            
            // 載入橫幅圖片
            if (siteSettings.hero_image) {
                document.getElementById('currentHeroImage').src = siteSettings.hero_image;
            }
            
            // 載入公告設定
            if (siteSettings.announcement_enabled) {
                document.getElementById('announcementEnabled').checked = siteSettings.announcement_enabled === 'true';
                toggleAnnouncement();
                
                if (siteSettings.announcement_enabled === 'true') {
                    document.getElementById('announcementType').value = siteSettings.announcement_type || 'info';
                    document.getElementById('announcementTitle').value = siteSettings.announcement_title || '';
                    document.getElementById('announcementContent').value = siteSettings.announcement_content || '';
                    document.getElementById('announcementLink').value = siteSettings.announcement_link || '';
                }
            }
        }
    } catch (error) {
        console.error('載入設定失敗:', error);
        alert('載入設定失敗，請重新整理頁面');
    }
}

// 預覽 logo
function previewLogo() {
    const input = document.getElementById('newLogo');
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.borderRadius = '50%';
            img.style.marginTop = '10px';
            img.style.objectFit = 'cover';
            preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 更新 logo
document.getElementById('logoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const input = document.getElementById('newLogo');
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('image', input.files[0]);
        
        try {
            // 上傳圖片
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                
                // 更新設定
                const updateResponse = await fetch('/api/settings/site_logo', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value: uploadResult.filename })
                });
                
                if (updateResponse.ok) {
                    alert('Logo 已更新！');
                    document.getElementById('currentLogo').src = uploadResult.filename;
                    input.value = '';
                    document.getElementById('logoPreview').innerHTML = '';
                    siteSettings.site_logo = uploadResult.filename;
                } else {
                    alert('更新設定失敗');
                }
            } else {
                alert('上傳失敗');
            }
        } catch (error) {
            console.error('上傳 logo 失敗:', error);
            alert('上傳失敗，請重試');
        }
    } else {
        alert('請選擇要上傳的圖片！');
    }
});

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
document.getElementById('heroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const input = document.getElementById('newHeroImage');
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('image', input.files[0]);
        
        try {
            // 上傳圖片
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                
                // 更新設定
                const updateResponse = await fetch('/api/settings/hero_image', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value: uploadResult.filename })
                });
                
                if (updateResponse.ok) {
                    alert('橫幅圖片已更新！');
                    document.getElementById('currentHeroImage').src = uploadResult.filename;
                    input.value = '';
                    document.getElementById('heroImagePreview').innerHTML = '';
                    siteSettings.hero_image = uploadResult.filename;
                } else {
                    alert('更新設定失敗');
                }
            } else {
                alert('上傳失敗');
            }
        } catch (error) {
            console.error('上傳橫幅圖片失敗:', error);
            alert('上傳失敗，請重試');
        }
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
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const enabled = document.getElementById('announcementEnabled').checked;
    const type = document.getElementById('announcementType').value;
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const link = document.getElementById('announcementLink').value;
    
    try {
        const updates = [
            { key: 'announcement_enabled', value: enabled.toString() },
            { key: 'announcement_type', value: type },
            { key: 'announcement_title', value: title },
            { key: 'announcement_content', value: content },
            { key: 'announcement_link', value: link }
        ];
        
        for (const update of updates) {
            const response = await fetch(`/api/settings/${update.key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: update.value })
            });
            
            if (!response.ok) {
                throw new Error(`更新 ${update.key} 失敗`);
            }
        }
        
        alert('公告設定已儲存！');
        
        // 更新本地設定
        siteSettings.announcement_enabled = enabled.toString();
        siteSettings.announcement_type = type;
        siteSettings.announcement_title = title;
        siteSettings.announcement_content = content;
        siteSettings.announcement_link = link;
        
    } catch (error) {
        console.error('儲存公告設定失敗:', error);
        alert('儲存失敗，請重試');
    }
});