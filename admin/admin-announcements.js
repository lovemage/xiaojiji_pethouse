// 公告管理 JavaScript

let currentEditId = null;

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncements();
});

// 載入公告列表
async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements');
        if (!response.ok) {
            throw new Error('載入公告失敗');
        }
        
        const announcements = await response.json();
        renderAnnouncementsTable(announcements);
    } catch (error) {
        console.error('載入公告錯誤:', error);
        showMessage('載入公告失敗: ' + error.message, 'error');
    }
}

// 渲染公告表格
function renderAnnouncementsTable(announcements) {
    const tbody = document.getElementById('announcementsTable');
    
    if (announcements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">暫無公告資料</td></tr>';
        return;
    }
    
    tbody.innerHTML = announcements.map(announcement => `
        <tr>
            <td class="announcement-title">${announcement.title}</td>
            <td>
                <span class="type-badge type-${announcement.type}">
                    ${getTypeText(announcement.type)}
                </span>
            </td>
            <td>
                <span class="status-badge ${announcement.is_active ? 'status-active' : 'status-inactive'}">
                    ${announcement.is_active ? '啟用' : '停用'}
                </span>
            </td>
            <td>${formatDateTime(announcement.start_date)}</td>
            <td>${formatDateTime(announcement.end_date)}</td>
            <td>${formatDateTime(announcement.created_at)}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editAnnouncement(${announcement.id})" title="編輯">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteAnnouncement(${announcement.id})" title="刪除">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-toggle" onclick="toggleAnnouncementStatus(${announcement.id}, ${!announcement.is_active})" title="${announcement.is_active ? '停用' : '啟用'}">
                    <i class="fas fa-${announcement.is_active ? 'eye-slash' : 'eye'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 取得類型文字
function getTypeText(type) {
    const typeMap = {
        'info': '資訊',
        'warning': '警告',
        'success': '成功',
        'error': '錯誤'
    };
    return typeMap[type] || type;
}

// 格式化日期時間
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 顯示新增公告彈窗
function showAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = '新增公告';
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementModal').style.display = 'block';
}

// 編輯公告
async function editAnnouncement(id) {
    try {
        const response = await fetch(`/api/announcements/${id}`);
        if (!response.ok) {
            throw new Error('載入公告資料失敗');
        }
        
        const announcement = await response.json();
        currentEditId = id;
        
        // 填入表單
        document.getElementById('title').value = announcement.title;
        document.getElementById('content').value = announcement.content;
        document.getElementById('type').value = announcement.type;
        document.getElementById('is_active').value = announcement.is_active.toString();
        
        // 處理日期時間
        if (announcement.start_date) {
            document.getElementById('start_date').value = formatDateTimeForInput(announcement.start_date);
        }
        if (announcement.end_date) {
            document.getElementById('end_date').value = formatDateTimeForInput(announcement.end_date);
        }
        
        document.getElementById('modalTitle').textContent = '編輯公告';
        document.getElementById('announcementModal').style.display = 'block';
        
    } catch (error) {
        console.error('載入公告資料錯誤:', error);
        showMessage('載入公告資料失敗: ' + error.message, 'error');
    }
}

// 格式化日期時間供 input 使用
function formatDateTimeForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 刪除公告
async function deleteAnnouncement(id) {
    if (!confirm('確定要刪除這個公告嗎？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/announcements/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('刪除公告失敗');
        }
        
        showMessage('公告刪除成功', 'success');
        loadAnnouncements();
    } catch (error) {
        console.error('刪除公告錯誤:', error);
        showMessage('刪除公告失敗: ' + error.message, 'error');
    }
}

// 切換公告狀態
async function toggleAnnouncementStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/announcements/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_active: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error('更新公告狀態失敗');
        }
        
        showMessage(`公告已${newStatus ? '啟用' : '停用'}`, 'success');
        loadAnnouncements();
    } catch (error) {
        console.error('更新公告狀態錯誤:', error);
        showMessage('更新公告狀態失敗: ' + error.message, 'error');
    }
}

// 關閉彈窗
function closeModal() {
    document.getElementById('announcementModal').style.display = 'none';
    currentEditId = null;
}

// 表單提交處理
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        is_active: formData.get('is_active') === 'true',
        start_date: formData.get('start_date') || null,
        end_date: formData.get('end_date') || null
    };
    
    try {
        const url = currentEditId ? `/api/announcements/${currentEditId}` : '/api/announcements';
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(announcementData)
        });
        
        if (!response.ok) {
            throw new Error(currentEditId ? '更新公告失敗' : '新增公告失敗');
        }
        
        showMessage(currentEditId ? '公告更新成功' : '公告新增成功', 'success');
        closeModal();
        loadAnnouncements();
        
    } catch (error) {
        console.error('儲存公告錯誤:', error);
        showMessage('儲存公告失敗: ' + error.message, 'error');
    }
});

// 顯示訊息
function showMessage(message, type = 'info') {
    // 創建訊息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message admin-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        ${message}
    `;
    
    // 添加到頁面
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// 點擊彈窗外部關閉
window.onclick = function(event) {
    const modal = document.getElementById('announcementModal');
    if (event.target === modal) {
        closeModal();
    }
} 