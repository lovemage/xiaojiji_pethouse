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
        // 目前使用靜態數據，之後可以從 API 載入
        galleryImages = [
            {
                id: 1,
                src: '../images/64805.jpg',
                title: '邊境牧羊犬幼犬',
                description: '健康活潑的邊境牧羊犬幼犬，3個月大',
                category: 'puppy',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                src: '../images/download.jpg',
                title: '柯基犬幼犬',
                description: '萌萌的柯基犬幼犬，2個月大',
                category: 'puppy',
                createdAt: '2024-01-14'
            },
            {
                id: 3,
                src: '../images/download-1.jpg',
                title: '黃金獵犬',
                description: '溫順友善的黃金獵犬成犬',
                category: 'adult',
                createdAt: '2024-01-13'
            },
            {
                id: 4,
                src: '../images/download-2.jpg',
                title: '柴犬',
                description: '聰明活潑的柴犬成犬',
                category: 'adult',
                createdAt: '2024-01-12'
            },
            {
                id: 5,
                src: '../images/RnWoowUwUaWbUjTraVyj-6FYMm_TH-eUtdIZk7XSGZM.jpg',
                title: '犬舍環境',
                description: '乾淨整潔的犬舍環境，給狗狗最好的生活空間',
                category: 'daily',
                createdAt: '2024-01-11'
            },
            {
                id: 6,
                src: '../images/pkncb1-golden-retriever-puppy-running-outdoors-in-grass.png',
                title: '戶外訓練',
                description: '狗狗在戶外草地上快樂奔跑的訓練時光',
                category: 'training',
                createdAt: '2024-01-10'
            },
            {
                id: 7,
                src: '../images/Pets-Health.jpg',
                title: '健康檢查',
                description: '定期的健康檢查，確保每隻狗狗都健康',
                category: 'puppy',
                createdAt: '2024-01-09'
            },
            {
                id: 8,
                src: '../images/pets-Health2.jpg',
                title: '日常照護',
                description: '專業的日常照護，讓狗狗健康成長',
                category: 'daily',
                createdAt: '2024-01-08'
            }
        ];
        
        displayGalleryImages();
        
    } catch (error) {
        console.error('載入相簿圖片失敗:', error);
        showNotification('載入相簿圖片失敗', 'error');
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
                <img src="${image.src}" alt="${image.title}">
                <div class="image-overlay">
                    <button class="btn-icon" onclick="editImage(${image.id})" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteImage(${image.id})" title="刪除">
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
        grid.appendChild(imageCard);
    });
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
    
    const formData = new FormData();
    const fileInput = document.getElementById('imageFile');
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDescription').value;
    const category = document.getElementById('imageCategory').value;
    
    if (!fileInput.files[0]) {
        showNotification('請選擇圖片檔案', 'error');
        return;
    }
    
    try {
        // 模擬新增圖片（實際應該上傳到伺服器）
        const newImage = {
            id: Date.now(),
            src: URL.createObjectURL(fileInput.files[0]),
            title: title,
            description: description,
            category: category,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        galleryImages.unshift(newImage);
        displayGalleryImages();
        closeAddImageModal();
        showNotification('圖片新增成功', 'success');
        
    } catch (error) {
        console.error('新增圖片失敗:', error);
        showNotification('新增圖片失敗', 'error');
    }
}

// 編輯圖片
function editImage(imageId) {
    const image = galleryImages.find(img => img.id === imageId);
    if (!image) return;
    
    // 填入表單數據
    document.getElementById('editImageId').value = image.id;
    document.getElementById('editImageTitle').value = image.title;
    document.getElementById('editImageDescription').value = image.description;
    document.getElementById('editImageCategory').value = image.category;
    
    // 顯示目前圖片
    document.getElementById('currentImage').innerHTML = `
        <img src="${image.src}" alt="${image.title}" style="max-width: 200px; height: auto;">
    `;
    
    // 顯示彈窗
    document.getElementById('editImageModal').style.display = 'block';
}

// 關閉編輯圖片彈窗
function closeEditImageModal() {
    document.getElementById('editImageModal').style.display = 'none';
    document.getElementById('editImageForm').reset();
}

// 處理編輯圖片
async function handleEditImage(event) {
    event.preventDefault();
    
    const imageId = parseInt(document.getElementById('editImageId').value);
    const title = document.getElementById('editImageTitle').value;
    const description = document.getElementById('editImageDescription').value;
    const category = document.getElementById('editImageCategory').value;
    
    try {
        // 更新圖片資料
        const imageIndex = galleryImages.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
            galleryImages[imageIndex] = {
                ...galleryImages[imageIndex],
                title: title,
                description: description,
                category: category
            };
            
            displayGalleryImages();
            closeEditImageModal();
            showNotification('圖片更新成功', 'success');
        }
        
    } catch (error) {
        console.error('更新圖片失敗:', error);
        showNotification('更新圖片失敗', 'error');
    }
}

// 刪除圖片
async function deleteImage(imageId) {
    if (!confirm('確定要刪除這張圖片嗎？')) return;
    
    try {
        // 從陣列中移除
        galleryImages = galleryImages.filter(img => img.id !== imageId);
        displayGalleryImages();
        showNotification('圖片刪除成功', 'success');
        
    } catch (error) {
        console.error('刪除圖片失敗:', error);
        showNotification('刪除圖片失敗', 'error');
    }
}

// 獲取分類名稱
function getCategoryName(category) {
    const categoryNames = {
        puppy: '幼犬',
        adult: '成犬',
        training: '訓練',
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