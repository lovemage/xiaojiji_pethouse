// 公告管理 JavaScript

let announcements = [];

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncements();
    
    // 綁定表單提交事件
    document.getElementById('addAnnouncementForm').addEventListener('submit', handleAddAnnouncement);
    document.getElementById('editAnnouncementForm').addEventListener('submit', handleEditAnnouncement);
});

// 載入公告
async function loadAnnouncements() {
    try {
        announcements = await API.getAnnouncements();
        displayAnnouncements();
        console.log('載入了', announcements.length, '個公告');
    } catch (error) {
        console.error('載入公告失敗:', error);
        showNotification('載入公告失敗', 'error');
    }
}

// 顯示公告
function displayAnnouncements() {
    const grid = document.getElementById('announcementsGrid');
    const filter = document.getElementById('statusFilter').value;
    
    // 篩選公告
    let filteredAnnouncements = announcements;
    if (filter === 'active') {
        filteredAnnouncements = announcements.filter(a => a.is_active);
    } else if (filter === 'inactive') {
        filteredAnnouncements = announcements.filter(a => !a.is_active);
    }
    
    // 排序：置頂的在前面
    filteredAnnouncements.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    if (filteredAnnouncements.length === 0) {
        grid.innerHTML = '<div class="no-data">目前沒有公告</div>';
        return;
    }
    
    grid.innerHTML = filteredAnnouncements.map(announcement => `
        <div class="announcement-card ${announcement.is_active ? 'active' : 'inactive'} ${announcement.is_pinned ? 'pinned' : ''}">
            <div class="announcement-header">
                <div class="announcement-type type-${announcement.type}">
                    <i class="fas fa-${getTypeIcon(announcement.type)}"></i>
                    ${getTypeName(announcement.type)}
                </div>
                <div class="announcement-status">
                    ${announcement.is_pinned ? '<span class="pin-badge"><i class="fas fa-thumbtack"></i> 置頂</span>' : ''}
                    <span class="status-badge ${announcement.is_active ? 'active' : 'inactive'}">
                        ${announcement.is_active ? '啟用' : '停用'}
                    </span>
                </div>
            </div>
            
            <div class="announcement-content">
                <h3>${announcement.title}</h3>
                <p class="announcement-text">${announcement.content}</p>
                
                <div class="announcement-dates">
                    ${announcement.start_date ? `<span><i class="fas fa-calendar-alt"></i> 開始: ${formatDate(announcement.start_date)}</span>` : ''}
                    ${announcement.end_date ? `<span><i class="fas fa-calendar-alt"></i> 結束: ${formatDate(announcement.end_date)}</span>` : ''}
                </div>
                
                <div class="announcement-meta">
                    <span><i class="fas fa-clock"></i> 建立於 ${formatDateTime(announcement.created_at)}</span>
                    ${announcement.updated_at !== announcement.created_at ? 
                        `<span><i class="fas fa-edit"></i> 更新於 ${formatDateTime(announcement.updated_at)}</span>` : ''}
                </div>
            </div>
            
            <div class="announcement-actions">
                <button class="btn-secondary" onclick="editAnnouncement(${announcement.id})">
                    <i class="fas fa-edit"></i> 編輯
                </button>
                <button class="btn-danger" onclick="deleteAnnouncement(${announcement.id})">
                    <i class="fas fa-trash"></i> 刪除
                </button>
            </div>
        </div>
    `).join('');
}

// 獲取類型圖標
function getTypeIcon(type) {
    const icons = {
        'general': 'info-circle',
        'promotion': 'tag',
        'notice': 'exclamation-triangle',
        'update': 'sync-alt',
        'info': 'info-circle',
        'warning': 'exclamation-triangle',
        'success': 'check-circle',
        'error': 'times-circle'
    };
    return icons[type] || 'info-circle';
}

// 獲取類型名稱
function getTypeName(type) {
    const names = {
        'general': '一般資訊',
        'promotion': '優惠活動',
        'notice': '重要通知',
        'update': '系統更新',
        'info': '一般資訊',
        'warning': '警告',
        'success': '成功',
        'error': '錯誤'
    };
    return names[type] || '一般資訊';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
}

// 格式化日期時間
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW');
}

// 篩選公告
function filterAnnouncements() {
    displayAnnouncements();
}

// 開啟新增公告模態框
function openAddAnnouncementModal() {
    document.getElementById('addAnnouncementModal').style.display = 'block';
    document.getElementById('addAnnouncementForm').reset();
}

// 關閉新增公告模態框
function closeAddAnnouncementModal() {
    document.getElementById('addAnnouncementModal').style.display = 'none';
}

// 處理新增公告
async function handleAddAnnouncement(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        startDate: formData.get('startDate') || null,
        endDate: formData.get('endDate') || null
    };
    
    try {
        const newAnnouncement = await API.createAnnouncement(announcementData);
        announcements.unshift(newAnnouncement);
        displayAnnouncements();
        closeAddAnnouncementModal();
        showNotification('公告新增成功', 'success');
    } catch (error) {
        console.error('新增公告失敗:', error);
        showNotification('新增公告失敗', 'error');
    }
}

// 編輯公告
function editAnnouncement(id) {
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;
    
    // 填入表單
    document.getElementById('editAnnouncementId').value = announcement.id;
    document.getElementById('editAnnouncementTitle').value = announcement.title;
    document.getElementById('editAnnouncementContent').value = announcement.content;
    document.getElementById('editAnnouncementType').value = announcement.type;
    document.getElementById('editStartDate').value = announcement.start_date ? announcement.start_date.split('T')[0] : '';
    document.getElementById('editEndDate').value = announcement.end_date ? announcement.end_date.split('T')[0] : '';
    document.getElementById('editIsActive').checked = announcement.is_active;
    document.getElementById('editIsPinned').checked = announcement.is_pinned;
    
    // 顯示模態框
    document.getElementById('editAnnouncementModal').style.display = 'block';
}

// 關閉編輯公告模態框
function closeEditAnnouncementModal() {
    document.getElementById('editAnnouncementModal').style.display = 'none';
}

// 處理編輯公告
async function handleEditAnnouncement(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const id = parseInt(formData.get('id'));
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        startDate: formData.get('startDate') || null,
        endDate: formData.get('endDate') || null,
        isActive: formData.get('isActive') === 'on',
        isPinned: formData.get('isPinned') === 'on'
    };
    
    try {
        const updatedAnnouncement = await API.updateAnnouncement(id, announcementData);
        
        // 更新本地資料
        const index = announcements.findIndex(a => a.id === id);
        if (index !== -1) {
            announcements[index] = updatedAnnouncement;
            displayAnnouncements();
            closeEditAnnouncementModal();
            showNotification('公告更新成功', 'success');
        }
    } catch (error) {
        console.error('更新公告失敗:', error);
        showNotification('更新公告失敗', 'error');
    }
}

// 刪除公告
async function deleteAnnouncement(id) {
    if (!confirm('確定要刪除這個公告嗎？')) return;
    
    try {
        await API.deleteAnnouncement(id);
        announcements = announcements.filter(a => a.id !== id);
        displayAnnouncements();
        showNotification('公告刪除成功', 'success');
    } catch (error) {
        console.error('刪除公告失敗:', error);
        showNotification('刪除公告失敗', 'error');
    }
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 自動移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 點擊模態框背景關閉
window.onclick = function(event) {
    const addModal = document.getElementById('addAnnouncementModal');
    const editModal = document.getElementById('editAnnouncementModal');
    
    if (event.target === addModal) {
        closeAddAnnouncementModal();
    }
    if (event.target === editModal) {
        closeEditAnnouncementModal();
    }
}; 