// 相簿管理功能
let galleryImages = [];
let currentFilter = 'all';

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    loadGalleryImages();
    initializeFilters();
    initializeForms();
});

// 載入相簿圖片
async function loadGalleryImages() {
    try {
        // 從資料庫 API 載入相簿資料
        const images = await API.getGalleryImages();
        
        // 轉換資料格式以符合現有代碼
        galleryImages = images.map(img => ({
            id: img.id,
            src: img.src,
            title: img.title,
            description: img.description,
            category: img.category,
            createdAt: img.created_at,
            sortOrder: img.sort_order,
            isActive: img.is_active
        }));
        
        displayGalleryImages();
        console.log('從資料庫載入了', galleryImages.length, '張圖片');
        
    } catch (error) {
        console.error('載入相簿圖片失敗:', error);
        showNotification('載入相簿圖片失敗', 'error');
        
        // 如果 API 失敗，顯示錯誤訊息
        const grid = document.getElementById('adminGalleryGrid');
        if (grid) {
            grid.innerHTML = '<div class="no-data">載入圖片失敗，請檢查網路連接</div>';
        }
    }
}

// 顯示相簿圖片
function displayGalleryImages() {
    const grid = document.getElementById('adminGalleryGrid');
    const filteredImages = currentFilter === 'all' 
        ? galleryImages 
        : galleryImages.filter(img => img.category === currentFilter);
    
    grid.innerHTML = '';
    
    if (filteredImages.length === 0) {
        grid.innerHTML = '<div class="no-data">沒有找到相關圖片</div>';
        return;
    }
    
    filteredImages.forEach(image => {
        const imageCard = document.createElement('div');
        imageCard.className = 'gallery-card';
        imageCard.innerHTML = `
            <div class="gallery-image">
                <img src="../${image.src}" alt="${image.title}">
                <div class="image-overlay">
                    <button class="btn-icon edit-btn" data-id="${image.id}" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger delete-btn" data-id="${image.id}" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="gallery-info">
                <h3>${image.title}</h3>
                <p class="category">${getCategoryName(image.category)}</p>
                <p class="description">${image.description}</p>
                <small class="date">上傳時間: ${formatDate(image.createdAt)}</small>
            </div>
        `;
        
        // 添加事件監聽器
        const editBtn = imageCard.querySelector('.edit-btn');
        const deleteBtn = imageCard.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const imageId = parseInt(e.currentTarget.dataset.id);
            console.log('編輯按鈕被點擊，圖片ID:', imageId);
            editImage(imageId);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const imageId = parseInt(e.currentTarget.dataset.id);
            console.log('刪除按鈕被點擊，圖片ID:', imageId);
            deleteImage(imageId);
        });
        
        grid.appendChild(imageCard);
    });
    
    console.log('顯示了', filteredImages.length, '張圖片');
}

// 初始化篩選器
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按鈕狀態
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新篩選器
            currentFilter = btn.dataset.category;
            displayGalleryImages();
        });
    });
}

// 初始化表單
function initializeForms() {
    // 新增圖片表單
    const addForm = document.getElementById('addImageForm');
    addForm.addEventListener('submit', handleAddImage);
    
    // 編輯圖片表單
    const editForm = document.getElementById('editImageForm');
    editForm.addEventListener('submit', handleEditImage);
    
    // 圖片預覽
    const imageFile = document.getElementById('imageFile');
    imageFile.addEventListener('change', handleImagePreview);
    
    // 編輯圖片預覽
    const editImageFile = document.getElementById('editImageFile');
    if (editImageFile) {
        editImageFile.addEventListener('change', handleEditImagePreview);
    }
}

// 處理圖片預覽
function handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="預覽圖片">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 處理編輯圖片預覽
function handleEditImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="新圖片預覽">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 顯示新增圖片彈窗
function showAddImageModal() {
    document.getElementById('addImageModal').style.display = 'block';
}

// 關閉新增圖片彈窗
function closeAddImageModal() {
    document.getElementById('addImageModal').style.display = 'none';
    document.getElementById('addImageForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// 處理新增圖片
async function handleAddImage(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('imageFile');
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDescription').value;
    const category = document.getElementById('imageCategory').value;
    
    if (!fileInput.files[0]) {
        showNotification('請選擇圖片檔案', 'error');
        return;
    }
    
    try {
        // 創建 FormData 用於上傳
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('sortOrder', galleryImages.length + 1);
        
        // 調用 API 新增圖片
        const newImage = await API.createGalleryImage(formData);
        
        // 更新本地資料
        galleryImages.unshift({
            id: newImage.id,
            src: newImage.src,
            title: newImage.title,
            description: newImage.description,
            category: newImage.category,
            createdAt: newImage.created_at,
            sortOrder: newImage.sort_order,
            isActive: newImage.is_active
        });
        
        displayGalleryImages();
        closeAddImageModal();
        showNotification('圖片新增成功', 'success');
        
    } catch (error) {
        console.error('新增圖片失敗:', error);
        showNotification('新增圖片失敗：' + (error.message || '未知錯誤'), 'error');
    }
}

// 編輯圖片
function editImage(imageId) {
    console.log('編輯圖片被點擊，ID:', imageId); // 調試信息
    
    const image = galleryImages.find(img => img.id === imageId);
    if (!image) {
        console.error('找不到圖片，ID:', imageId);
        showNotification('找不到指定的圖片', 'error');
        return;
    }
    
    console.log('找到圖片:', image); // 調試信息
    
    try {
    // 填入表單數據
    document.getElementById('editImageId').value = image.id;
    document.getElementById('editImageTitle').value = image.title;
    document.getElementById('editImageDescription').value = image.description;
    document.getElementById('editImageCategory').value = image.category;
    
    // 顯示目前圖片
    document.getElementById('currentImage').innerHTML = `
            <img src="../${image.src}" alt="${image.title}" style="max-width: 200px; height: auto; border-radius: 5px;">
    `;
    
    // 顯示彈窗
        const modal = document.getElementById('editImageModal');
        if (modal) {
            modal.style.display = 'block';
            console.log('編輯彈窗已顯示'); // 調試信息
        } else {
            console.error('找不到編輯彈窗元素');
        }
        
    } catch (error) {
        console.error('編輯圖片時發生錯誤:', error);
        showNotification('編輯圖片時發生錯誤', 'error');
    }
}

// 關閉編輯圖片彈窗
function closeEditImageModal() {
    document.getElementById('editImageModal').style.display = 'none';
    document.getElementById('editImageForm').reset();
    document.getElementById('editImagePreview').innerHTML = '';
}

// 處理編輯圖片
async function handleEditImage(event) {
    event.preventDefault();
    
    const imageId = parseInt(document.getElementById('editImageId').value);
    const title = document.getElementById('editImageTitle').value;
    const description = document.getElementById('editImageDescription').value;
    const category = document.getElementById('editImageCategory').value;
    const imageFile = document.getElementById('editImageFile').files[0];
    
    try {
        // 創建 FormData 用於更新
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('isActive', true);
        
        // 如果有選擇新圖片，添加到 FormData
        if (imageFile) {
            formData.append('image', imageFile);
            console.log('已添加新圖片到 FormData:', imageFile.name);
        }
        
        // 調用 API 更新圖片
        const updatedImage = await API.updateGalleryImage(imageId, formData);
        
        // 更新本地資料
        const imageIndex = galleryImages.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
            galleryImages[imageIndex] = {
                id: updatedImage.id,
                src: updatedImage.src,
                title: updatedImage.title,
                description: updatedImage.description,
                category: updatedImage.category,
                createdAt: updatedImage.created_at,
                sortOrder: updatedImage.sort_order,
                isActive: updatedImage.is_active
            };
            
            displayGalleryImages();
            closeEditImageModal();
            showNotification(imageFile ? '圖片和資料更新成功' : '圖片資料更新成功', 'success');
        }
        
    } catch (error) {
        console.error('更新圖片失敗:', error);
        showNotification('更新圖片失敗：' + (error.message || '未知錯誤'), 'error');
    }
}

// 刪除圖片
async function deleteImage(imageId) {
    if (!confirm('確定要刪除這張圖片嗎？')) return;
    
    try {
        // 調用 API 刪除圖片
        await API.deleteGalleryImage(imageId);
        
        // 從本地資料中移除
        galleryImages = galleryImages.filter(img => img.id !== imageId);
        displayGalleryImages();
        showNotification('圖片刪除成功', 'success');
        
    } catch (error) {
        console.error('刪除圖片失敗:', error);
        showNotification('刪除圖片失敗：' + (error.message || '未知錯誤'), 'error');
    }
}

// 獲取分類名稱
function getCategoryName(category) {
    const categoryNames = {
        puppy: '幼犬',
        adult: '成犬',

        daily: '日常'
    };
    return categoryNames[category] || category;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 自動移除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 點擊彈窗外部關閉
window.onclick = function(event) {
    const addModal = document.getElementById('addImageModal');
    const editModal = document.getElementById('editImageModal');
    
    if (event.target === addModal) {
        closeAddImageModal();
    }
    if (event.target === editModal) {
        closeEditImageModal();
    }
} 