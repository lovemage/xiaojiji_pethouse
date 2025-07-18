// 網站設定管理
let siteSettings = {};

// 載入設定
async function loadSettings() {
    try {
        const settings = await API.getSettings();
        siteSettings = settings;
        loadCurrentSettings();
        console.log('設定載入成功:', settings);
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
    } else {
        // 如果沒有設定，使用預設的webp圖片
        document.getElementById('currentHeroImage').src = '../images/pkncb1-golden-retriever-puppy-running-outdoors-in-grass.webp';
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

// 確保函數在全域作用域可用
window.previewHeroImage = previewHeroImage;

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
        // 使用 Cloudinary CDN 上傳
        console.log('開始上傳hero圖片到CDN...');
        
        const formData = new FormData();
        formData.append('heroImage', file);
        
        const response = await API.uploadHeroImage(formData);
        
        if (response.success) {
            siteSettings.heroImage = response.imageUrl;
            document.getElementById('currentHeroImage').src = response.imageUrl;
            alert('橫幅圖片已更新！');
            console.log('Hero圖片上傳成功:', response.imageUrl);
            
            // 重新載入設定以確保UI更新
            loadCurrentSettings();
            
            // 通知前端更新hero圖片
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'heroImageUpdated',
                    imageUrl: response.imageUrl
                }, '*');
            }
        } else {
            throw new Error('上傳失敗');
        }
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
        console.log('提交公告設定:', announcementData);
        await API.updateSetting('announcement', JSON.stringify(announcementData));
        siteSettings.announcement = announcementData;
        alert('公告設定已儲存！');
        console.log('公告設定儲存成功');
        
        // 重新載入設定以確保UI更新
        loadCurrentSettings();
    } catch (error) {
        console.error('儲存公告設定失敗:', error);
        // 如果 API 失敗，使用 localStorage 作為備份
        siteSettings.announcement = announcementData;
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

// 更新顯示設定狀態
function updateDisplayStatus(settingName) {
    const toggle = document.getElementById(settingName);
    const status = document.getElementById(settingName + 'Status');
    if (toggle && status) {
        status.textContent = toggle.checked ? '開啟' : '關閉';
    }
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

// 載入顯示設定
async function loadDisplaySettings() {
    try {
        const settings = await API.getSettings();

        // 設定映射表
        const settingMap = {
            'showName': 'show_name',
            'showBreed': 'show_breed',
            'showAge': 'show_age',
            'showGender': 'show_gender',
            'showPrice': 'show_price',
            'showColor': 'show_color',
            'showDescription': 'show_description',
            'showHealth': 'show_health'
        };

        Object.entries(settingMap).forEach(([frontendKey, serverKey]) => {
            const toggle = document.getElementById(frontendKey);

            if (toggle && settings[serverKey] !== undefined) {
                // 正確處理字串到布林值的轉換
                const value = settings[serverKey];
                toggle.checked = value === true || value === 'true';
                updateDisplayStatus(frontendKey);
                console.log(`載入設定: ${frontendKey} -> ${serverKey} = ${value} (checked: ${toggle.checked})`);
            }
        });

    } catch (error) {
        console.error('載入顯示設定失敗:', error);
    }
}

// 前台卡片顯示設定表單提交
document.getElementById('cardDisplayForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const displayData = {
        show_name: document.getElementById('showName').checked,
        show_breed: document.getElementById('showBreed').checked,
        show_age: document.getElementById('showAge').checked,
        show_gender: document.getElementById('showGender').checked,
        show_price: document.getElementById('showPrice').checked,
        show_color: document.getElementById('showColor').checked,
        show_description: document.getElementById('showDescription').checked,
        show_health: document.getElementById('showHealth').checked
    };

    try {
        console.log('提交顯示設定:', displayData);
        
        // 更新每個設定項目
        for (const [key, value] of Object.entries(displayData)) {
            await API.updateSetting(key, value);
            console.log(`更新設定: ${key} = ${value}`);
        }

        alert('顯示設定已儲存！');
        console.log('顯示設定儲存成功');
        
        // 重新載入設定以確保UI更新
        await loadDisplaySettings();

        // 通知前端更新顯示
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'displaySettingsUpdated',
                data: displayData
            }, '*');
        }

    } catch (error) {
        console.error('儲存顯示設定失敗:', error);
        alert('儲存失敗，請稍後再試');
    }
});

// 頁面載入時載入設定
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadDisplaySettings();
});