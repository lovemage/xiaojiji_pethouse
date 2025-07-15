// 寵物管理系統
let pets = [];

// 初始化預設寵物資料（如果 localStorage 中沒有資料）
function initializePetsData() {
    const existingPets = JSON.parse(localStorage.getItem('pets') || '[]');
    
    if (existingPets.length === 0) {
        // 預設寵物資料
        const defaultPets = [
            {
                id: 1,
                name: '小黑',
                breed: '邊境牧羊犬',
                birthdate: '2024-01-15',
                age: '3個月大',
                gender: 'male',
                color: '黑白色',
                category: 'medium',
                price: 35000,
                description: '活潑聰明的邊境牧羊犬幼犬，已完成基礎訓練',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/64805.jpg'],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: '小花',
                breed: '柯基犬',
                birthdate: '2024-02-01',
                age: '2個月大',
                gender: 'female',
                color: '三色',
                category: 'small',
                price: 38000,
                description: '可愛的柯基犬幼犬，性格溫順',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/download.jpg'],
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: '露西',
                breed: '黃金獵犬',
                birthdate: '2023-12-01',
                age: '4個月大',
                gender: 'female',
                color: '金色',
                category: 'large',
                price: 45000,
                description: '溫順的黃金獵犬幼犬，適合家庭飼養',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/download-1.jpg'],
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: '小白',
                breed: '柴犬',
                birthdate: '2023-12-15',
                age: '4個月大',
                gender: 'male',
                color: '白色',
                category: 'medium',
                price: 32000,
                description: '忠誠的柴犬幼犬，個性獨立',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/download-2.jpg'],
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: '小咪',
                breed: '博美犬',
                birthdate: '2024-01-20',
                age: '3個月大',
                gender: 'female',
                color: '白色',
                category: 'small',
                price: 28000,
                description: '活潑可愛的博美犬幼犬，適合公寓飼養',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/Pets-Health.jpg'],
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                name: '大雄',
                breed: '拉布拉多',
                birthdate: '2023-11-01',
                age: '5個月大',
                gender: 'male',
                color: '黃色',
                category: 'large',
                price: 42000,
                description: '溫和的拉布拉多幼犬，很適合與小孩相處',
                health: '健康狀況良好，已接種疫苗',
                images: ['../images/pets-Health2.jpg'],
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('pets', JSON.stringify(defaultPets));
        pets = defaultPets;
    } else {
        pets = existingPets;
    }
}

// 計算年齡
function calculateAge() {
    const birthdate = document.getElementById('petBirthdate').value;
    if (birthdate) {
        const birth = new Date(birthdate);
        const today = new Date();
        const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                           (today.getMonth() - birth.getMonth());
        
        if (ageInMonths < 12) {
            document.getElementById('petAge').value = `${ageInMonths}個月`;
        } else {
            const years = Math.floor(ageInMonths / 12);
            const months = ageInMonths % 12;
            if (months === 0) {
                document.getElementById('petAge').value = `${years}歲`;
            } else {
                document.getElementById('petAge').value = `${years}歲${months}個月`;
            }
        }
    }
}

// 預覽圖片
function previewImages() {
    const input = document.getElementById('petImages');
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    if (input.files) {
        let hasOversizedFile = false;
        
        Array.from(input.files).forEach(file => {
            // 檢查檔案大小（2MB = 2 * 1024 * 1024 bytes）
            if (file.size > 2 * 1024 * 1024) {
                hasOversizedFile = true;
                preview.innerHTML += `<div style="color: red; margin: 10px 0;">檔案 "${file.name}" 超過2MB限制，請選擇較小的圖片</div>`;
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        
        if (hasOversizedFile) {
            // 清除檔案選擇
            input.value = '';
        }
    }
}

// 預覽編輯圖片
function previewEditImages() {
    const input = document.getElementById('editPetImages');
    const preview = document.getElementById('editImagePreview');
    preview.innerHTML = '';
    
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = `
                    width: 150px;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 2px solid #ddd;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                `;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 儲存寵物資料
if (document.getElementById('petForm')) {
    document.getElementById('petForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            
            // 檢查是否有上傳圖片
            const imageFiles = document.getElementById('petImages').files;
            
            // 如果沒有上傳圖片，使用預設圖片
            if (imageFiles.length === 0) {
                try {
                    // 創建一個預設圖片的 blob
                    const response = await fetch('../images/64805.jpg');
                    if (response.ok) {
                        const blob = await response.blob();
                        const defaultFile = new File([blob], '64805.jpg', { type: 'image/jpeg' });
                        formData.append('images', defaultFile);
                    } else {
                        console.warn('無法載入預設圖片，將不附加圖片');
                    }
                } catch (error) {
                    console.warn('載入預設圖片時發生錯誤:', error);
                }
            }
            
            // 使用 API 新增寵物
            const result = await API.createPet(formData);
            
            showNotification('寵物資料已儲存！', 'success');
            
            // 延遲跳轉，讓用戶看到成功訊息
            setTimeout(() => {
            window.location.href = 'pets.html';
            }, 1500);
            
        } catch (error) {
            console.error('儲存寵物資料失敗:', error);
            showNotification('儲存失敗，請稍後再試。', 'error');
        }
    });
}

// 載入寵物列表
async function loadPets() {
    try {
        const pets = await API.getPets();
        const tbody = document.getElementById('petsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        pets.forEach(pet => {
            const tr = document.createElement('tr');
            
            // 處理圖片
            let images = [];
            if (pet.images) {
                if (typeof pet.images === 'string') {
                    try {
                        images = JSON.parse(pet.images);
                    } catch (e) {
                        images = [pet.images];
                    }
                } else if (Array.isArray(pet.images)) {
                    images = pet.images;
                }
            }
            // 支援 Base64 格式（以 data: 開頭）和 URL 格式
            let imageUrl = '';
            if (images.length > 0) {
                // 如果是 Base64 格式，直接使用；否則加上相對路徑
                imageUrl = images[0].startsWith('data:') ? images[0] : `../${images[0]}`;
            } else {
                imageUrl = '../images/64805.jpg';
            }
            
            tr.innerHTML = `
                <td>
                    <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${pet.name}</td>
                <td>${pet.breed}</td>
                <td>${pet.description || '無描述'}</td>
                <td>
                    <div class="table-actions">
                        <button onclick="editPet(${pet.id})" class="btn-edit" title="編輯寵物資料">
                            <i class="fas fa-edit"></i> 編輯
                        </button>
                        <button onclick="copyPet(${pet.id})" class="btn-copy" title="複製此寵物">
                            <i class="fas fa-copy"></i> 複製
                        </button>
                        <button onclick="deletePet(${pet.id})" class="btn-delete" title="刪除寵物">
                            <i class="fas fa-trash"></i> 刪除
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('載入寵物列表失敗:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">載入失敗，請重新整理頁面</td></tr>';
        }
    }
}

// 複製寵物
async function copyPet(id) {
    // 使用 prompt 讓用戶選擇複製數量
    const input = prompt('請輸入要複製的數量（1-10）：', '1');
    
    if (input === null) {
        // 用戶取消了操作
        return;
    }
    
    const copyCount = parseInt(input);
    
    // 驗證輸入
    if (isNaN(copyCount) || copyCount < 1 || copyCount > 10) {
        showNotification('請輸入有效的數量（1-10）', 'error');
        return;
    }
    
    // 顯示確認對話框
    const confirmMessage = `確定要複製 ${copyCount} 隻寵物嗎？\n\n複製後會創建 ${copyCount} 個完全相同的新產品，\n您可以稍後編輯修改資料。`;

    if (confirm(confirmMessage)) {
        try {
            // 顯示載入狀態
            const loadingNotification = showNotification(`正在複製寵物...`, 'info', false);
            
            let successCount = 0;
            let failCount = 0;

            // 逐一複製寵物
            for (let i = 0; i < copyCount; i++) {
                try {
                    await API.copyPet(id);
                    successCount++;
                } catch (error) {
                    console.error(`複製第 ${i + 1} 隻寵物失敗:`, error);
                    failCount++;
                    
                    // 如果第一個就失敗，顯示錯誤訊息並停止
                    if (i === 0) {
                        if (loadingNotification) {
                            loadingNotification.remove();
                        }
                        showNotification(error.message || '複製功能暫時無法使用，請稍後再試。', 'error');
                        return;
                    }
                }
            }

            // 移除載入通知
            if (loadingNotification) {
                loadingNotification.remove();
            }

            // 重新載入寵物列表
            loadPets();

            // 顯示結果訊息
            if (failCount === 0) {
                showNotification(`成功複製 ${successCount} 隻寵物！`, 'success');
            } else {
                showNotification(`複製完成！成功 ${successCount} 隻，失敗 ${failCount} 隻`, 'warning');
            }

        } catch (error) {
            console.error('複製寵物失敗:', error);
            showNotification('複製失敗，請稍後再試。', 'error');
        }
    }
}

// 刪除寵物
async function deletePet(id) {
    if (confirm('確定要刪除這隻寵物嗎？\n\n此操作無法復原！')) {
        try {
            await API.deletePet(id);
            loadPets();
            showNotification('寵物已刪除！', 'success');
        } catch (error) {
            console.error('刪除寵物失敗:', error);
            showNotification('刪除失敗，請稍後再試。', 'error');
        }
    }
}

// 載入儀表板統計
function loadDashboardStats() {
    try {
        const pets = JSON.parse(localStorage.getItem('pets') || '[]');
        const totalPetsEl = document.getElementById('totalPets');
        const puppyCountEl = document.getElementById('puppyCount');
        
        if (totalPetsEl) {
            totalPetsEl.textContent = pets.length;
        }
        
        if (puppyCountEl) {
            const smallDogCount = pets.filter(pet => pet.category === 'small').length;
            puppyCountEl.textContent = smallDogCount;
        }
        
        // 載入最近的寵物
        const recentPetsEl = document.getElementById('recentPets');
        if (recentPetsEl) {
            const recentPets = pets.slice(-5).reverse();
            recentPetsEl.innerHTML = '';
            
            recentPets.forEach(pet => {
                const tr = document.createElement('tr');
                const imageUrl = pet.images && pet.images.length > 0 ? pet.images[0] : '../images/64805.jpg';
                
                tr.innerHTML = `
                    <td>
                        <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    </td>
                    <td>${pet.name}</td>
                    <td>${pet.breed}</td>
                    <td>${pet.description || '無描述'}</td>
                    <td>
                        <div class="table-actions">
                            <a href="edit-pet.html?id=${pet.id}" class="btn-edit">編輯</a>
                        </div>
                    </td>
                `;
                recentPetsEl.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('載入儀表板統計失敗:', error);
    }
}

// 編輯寵物
async function editPet(id) {
    try {
        const pets = await API.getPets();
        const pet = pets.find(p => p.id === id);
        
        if (!pet) {
            showNotification('找不到指定的寵物', 'error');
            return;
        }
        
        // 創建編輯表單彈窗
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
        `;
        modal.innerHTML = `
            <div class="modal-content" style="
                background-color: #fefefe;
                margin: 5% auto;
                padding: 20px;
                border: 1px solid #888;
                border-radius: 10px;
                width: 80%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            ">
                <span class="close" onclick="this.parentElement.parentElement.remove()" style="
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    position: absolute;
                    right: 15px;
                    top: 10px;
                ">&times;</span>
                <h2 style="margin-top: 0;">編輯寵物資料</h2>
                <style>
                    .edit-form-group {
                        margin-bottom: 15px;
                    }
                    .edit-form-group label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: bold;
                        color: #333;
                    }
                    .edit-form-group input,
                    .edit-form-group select,
                    .edit-form-group textarea {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                        box-sizing: border-box;
                        font-family: inherit;
                    }
                    .edit-form-group input:focus,
                    .edit-form-group select:focus,
                    .edit-form-group textarea:focus {
                        outline: none;
                        border-color: #007cba;
                        box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.1);
                    }
                    .form-actions {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .form-actions button {
                        margin-left: 10px;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 4px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: background-color 0.3s;
                    }
                    .btn-primary {
                        background-color: #007cba;
                        color: white;
                    }
                    .btn-primary:hover {
                        background-color: #005a87;
                    }
                    .btn-secondary {
                        background-color: #6c757d;
                        color: white;
                    }
                    .btn-secondary:hover {
                        background-color: #545b62;
                    }
                </style>
                <form id="editPetForm">
                    <input type="hidden" id="editPetId" value="${pet.id}">
                    
                    <div class="edit-form-group">
                        <label for="editPetName">寵物名稱</label>
                        <input type="text" id="editPetName" value="${pet.name}" required>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetBreed">品種</label>
                        <select id="editPetBreed" required>
                            <option value="">請選擇品種</option>
                            <optgroup label="大型犬">
                                <option value="黃金獵犬" ${pet.breed === '黃金獵犬' ? 'selected' : ''}>黃金獵犬</option>
                                <option value="邊境牧羊犬" ${pet.breed === '邊境牧羊犬' ? 'selected' : ''}>邊境牧羊犬</option>
                                <option value="哈士奇" ${pet.breed === '哈士奇' ? 'selected' : ''}>哈士奇</option>
                                <option value="拉布拉多" ${pet.breed === '拉布拉多' ? 'selected' : ''}>拉布拉多</option>
                                <option value="鬆獅犬" ${pet.breed === '鬆獅犬' ? 'selected' : ''}>鬆獅犬</option>
                                <option value="巨型貴賓" ${pet.breed === '巨型貴賓' ? 'selected' : ''}>巨型貴賓</option>
                                <option value="薩摩耶" ${pet.breed === '薩摩耶' ? 'selected' : ''}>薩摩耶</option>
                            </optgroup>
                            <optgroup label="中型犬">
                                <option value="柴犬" ${pet.breed === '柴犬' ? 'selected' : ''}>柴犬</option>
                                <option value="柯基犬" ${pet.breed === '柯基犬' ? 'selected' : ''}>柯基犬</option>
                                <option value="法國鬥牛犬" ${pet.breed === '法國鬥牛犬' ? 'selected' : ''}>法國鬥牛犬</option>
                                <option value="巴哥犬" ${pet.breed === '巴哥犬' ? 'selected' : ''}>巴哥犬</option>
                                <option value="米格魯" ${pet.breed === '米格魯' ? 'selected' : ''}>米格魯</option>
                                <option value="查理士" ${pet.breed === '查理士' ? 'selected' : ''}>查理士</option>
                            </optgroup>
                            <optgroup label="小型犬">
                                <option value="比熊犬" ${pet.breed === '比熊犬' ? 'selected' : ''}>比熊犬</option>
                                <option value="狐狸犬" ${pet.breed === '狐狸犬' ? 'selected' : ''}>狐狸犬</option>
                                <option value="長毛臘腸犬" ${pet.breed === '長毛臘腸犬' ? 'selected' : ''}>長毛臘腸犬</option>
                                <option value="短毛臘腸犬" ${pet.breed === '短毛臘腸犬' ? 'selected' : ''}>短毛臘腸犬</option>
                                <option value="傑克羅素" ${pet.breed === '傑克羅素' ? 'selected' : ''}>傑克羅素</option>
                                <option value="狐狸博美" ${pet.breed === '狐狸博美' ? 'selected' : ''}>狐狸博美</option>
                                <option value="西施犬" ${pet.breed === '西施犬' ? 'selected' : ''}>西施犬</option>
                                <option value="雪納瑞" ${pet.breed === '雪納瑞' ? 'selected' : ''}>雪納瑞</option>
                                <option value="騎士比熊" ${pet.breed === '騎士比熊' ? 'selected' : ''}>騎士比熊</option>
                                <option value="可卡布" ${pet.breed === '可卡布' ? 'selected' : ''}>可卡布</option>
                                <option value="瑪爾濟斯" ${pet.breed === '瑪爾濟斯' ? 'selected' : ''}>瑪爾濟斯</option>
                                <option value="貴賓" ${pet.breed === '貴賓' ? 'selected' : ''}>貴賓</option>
                                <option value="約克夏" ${pet.breed === '約克夏' ? 'selected' : ''}>約克夏</option>
                                <option value="博美" ${pet.breed === '博美' ? 'selected' : ''}>博美</option>
                                <option value="瑪爾泰迪" ${pet.breed === '瑪爾泰迪' ? 'selected' : ''}>瑪爾泰迪</option>
                                <option value="吉娃娃" ${pet.breed === '吉娃娃' ? 'selected' : ''}>吉娃娃</option>
                            </optgroup>
                        </select>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetAge">年齡</label>
                        <input type="text" id="editPetAge" value="${pet.age}" required>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetGender">性別</label>
                        <select id="editPetGender" required>
                            <option value="male" ${pet.gender === 'male' ? 'selected' : ''}>公犬</option>
                            <option value="female" ${pet.gender === 'female' ? 'selected' : ''}>母犬</option>
                        </select>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetColor">毛色</label>
                        <input type="text" id="editPetColor" value="${pet.color}" required>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetCategory">分類</label>
                        <select id="editPetCategory" required>
                            <option value="small" ${pet.category === 'small' ? 'selected' : ''}>小型犬</option>
                            <option value="medium" ${pet.category === 'medium' ? 'selected' : ''}>中型犬</option>
                            <option value="large" ${pet.category === 'large' ? 'selected' : ''}>大型犬</option>
                        </select>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetPrice">價格</label>
                        <input type="number" id="editPetPrice" value="${pet.price}" required>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetDescription">描述</label>
                        <textarea id="editPetDescription" rows="3" required>${pet.description}</textarea>
                    </div>
                    
                    <div class="edit-form-group">
                        <label for="editPetHealth">健康狀況</label>
                        <textarea id="editPetHealth" rows="3">${pet.health || ''}</textarea>
                    </div>
                    
                    <div class="edit-form-group">
                        <label>現有圖片管理</label>
                        <div id="existingImages" class="existing-images-container">
                            <!-- 現有圖片將在這裡顯示 -->
                        </div>
                        <small style="color: #666; font-size: 12px; display: block; margin-bottom: 10px;">
                            點擊 ❌ 刪除圖片 | 拖拽調整順序 | 第一張圖片為主要展示圖片
                        </small>
                    </div>

                    <div class="edit-form-group">
                        <label for="editPetImages">新增圖片</label>
                        <input type="file" id="editPetImages" name="images" multiple accept="image/png,.png" onchange="previewEditImages()">
                        <div class="image-preview" id="editImagePreview"></div>
                        <small style="color: #666; font-size: 12px;">僅支援 PNG 格式，最多可上傳 5 張圖片</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">更新寵物</button>
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);

        // 顯示現有圖片
        displayExistingImages(pet);

        // 處理表單提交
        document.getElementById('editPetForm').addEventListener('submit', handleEditPet);
        
        // 點擊背景關閉
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('載入寵物資料失敗:', error);
        showNotification('載入寵物資料失敗', 'error');
    }
}

// 處理編輯寵物
async function handleEditPet(event) {
    event.preventDefault();
    
    const petId = parseInt(document.getElementById('editPetId').value);
    
    // 創建 FormData 對象
    const formData = new FormData();
    formData.append('name', document.getElementById('editPetName').value);
    formData.append('breed', document.getElementById('editPetBreed').value);
    formData.append('age', document.getElementById('editPetAge').value);
    formData.append('gender', document.getElementById('editPetGender').value);
    formData.append('color', document.getElementById('editPetColor').value);
    formData.append('category', document.getElementById('editPetCategory').value);
    formData.append('price', parseFloat(document.getElementById('editPetPrice').value));
    formData.append('description', document.getElementById('editPetDescription').value);
    formData.append('health', document.getElementById('editPetHealth').value);
    
    // 處理圖片更新
    // 1. 先添加現有圖片（已經過刪除和排序處理）
    if (currentPetImages && currentPetImages.length > 0) {
        formData.append('existingImages', JSON.stringify(currentPetImages));
    }

    // 2. 添加新上傳的圖片
    const imageFiles = document.getElementById('editPetImages').files;
    if (imageFiles && imageFiles.length > 0) {
        // 檢查總圖片數量
        const totalImages = (currentPetImages ? currentPetImages.length : 0) + imageFiles.length;
        if (totalImages > 5) {
            alert(`總圖片數量不能超過5張！目前有${currentPetImages.length}張現有圖片，您選擇了${imageFiles.length}張新圖片。`);
            return;
        }

        Array.from(imageFiles).forEach(file => {
            formData.append('images', file);
        });
    }
    
    try {
        await API.updatePet(petId, formData);
        loadPets();
        document.querySelector('.modal').remove();
        showNotification('寵物資料更新成功！', 'success');
    } catch (error) {
        console.error('更新寵物資料失敗:', error);
        showNotification('更新失敗，請稍後再試。', 'error');
    }
}

// 顯示通知
function showNotification(message, type = 'info', autoHide = true) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加樣式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // 根據類型設置背景色
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 自動移除（如果啟用）
    if (autoHide) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // 返回通知元素，以便手動控制
    return notification;
}

// 顯示設定管理
const displaySettings = {
    showName: true,
    showBreed: true,
    showDescription: true,
    showAge: false,
    showGender: false,
    showPrice: false,
    showHealth: false,
    showColor: false
};

// 載入顯示設定
function loadDisplaySettings() {
    const saved = localStorage.getItem('petDisplaySettings');
    if (saved) {
        Object.assign(displaySettings, JSON.parse(saved));
    }
    
    // 更新開關狀態
    Object.keys(displaySettings).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.checked = displaySettings[key];
        }
    });
}

// 儲存顯示設定
function saveDisplaySettings() {
    Object.keys(displaySettings).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            displaySettings[key] = checkbox.checked;
        }
    });
    
    localStorage.setItem('petDisplaySettings', JSON.stringify(displaySettings));
    showNotification('前台顯示設定已儲存！', 'success');
    
    // 通知前台更新
    updateFrontendDisplay();
}

// 更新前台顯示
function updateFrontendDisplay() {
    // 將設定同步到前台
    localStorage.setItem('frontendDisplaySettings', JSON.stringify(displaySettings));
    
    // 如果前台頁面在同一個域名下，可以嘗試刷新
    try {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'displaySettingsUpdated',
                data: displaySettings
            }, '*');
        }
    } catch (e) {
        console.log('無法直接通知前台頁面更新');
    }
}

// 預覽效果
function previewChanges() {
    // 收集當前設定
    const currentSettings = {};
    Object.keys(displaySettings).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            currentSettings[key] = checkbox.checked;
        }
    });
    
    // 打開新視窗預覽
    const previewWindow = window.open('/', '_blank');
    
    // 等待頁面載入後應用設定
    setTimeout(() => {
        if (previewWindow && !previewWindow.closed) {
            previewWindow.postMessage({
                type: 'previewDisplaySettings',
                settings: currentSettings
            }, '*');
        }
    }, 2000);
    
    showNotification('預覽視窗已開啟，請查看效果', 'info');
}

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    loadPets();
    loadDashboardStats();
    loadDisplaySettings();
    
    // 綁定事件監聽器
    const saveBtn = document.getElementById('saveDisplaySettings');
    const previewBtn = document.getElementById('previewChanges');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDisplaySettings);
    }
    
    if (previewBtn) {
        previewBtn.addEventListener('click', previewChanges);
    }
});

// 全域變量存儲當前編輯的寵物圖片
let currentPetImages = [];

// 顯示現有圖片
function displayExistingImages(pet) {
    const container = document.getElementById('existingImages');
    if (!container) return;

    container.innerHTML = '';

    // 解析圖片數據
    let images = [];
    if (pet.images) {
        if (typeof pet.images === 'string') {
            try {
                images = JSON.parse(pet.images);
            } catch (e) {
                images = [pet.images];
            }
        } else if (Array.isArray(pet.images)) {
            images = pet.images;
        }
    }

    currentPetImages = [...images];

    if (images.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">此寵物暫無圖片</p>';
        return;
    }

    container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    `;

    images.forEach((imageUrl, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'existing-image-item';
        imageItem.draggable = true;
        imageItem.dataset.index = index;

        imageItem.style.cssText = `
            position: relative;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: move;
        `;

        imageItem.innerHTML = `
            <img src="${imageUrl}" alt="寵物圖片 ${index + 1}" style="
                width: 100%;
                height: 150px;
                object-fit: cover;
                display: block;
            ">
            <div class="image-controls" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(220, 53, 69, 0.9);
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <button onclick="deleteExistingImage(${index})" style="
                    background: none;
                    color: white;
                    border: none;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                " title="刪除圖片">×</button>
            </div>
            <div class="image-info" style="
                padding: 8px;
                font-size: 12px;
                color: #666;
                text-align: center;
                background: #f8f9fa;
                font-weight: ${index === 0 ? 'bold' : 'normal'};
                color: ${index === 0 ? '#007cba' : '#666'};
            ">
                ${index === 0 ? '🌟 主圖' : `第 ${index + 1} 張`}
            </div>
        `;

        // 拖拽事件
        imageItem.addEventListener('dragstart', handleDragStart);
        imageItem.addEventListener('dragover', handleDragOver);
        imageItem.addEventListener('drop', handleDrop);
        imageItem.addEventListener('dragend', handleDragEnd);

        container.appendChild(imageItem);
    });
}

// 刪除現有圖片
function deleteExistingImage(index) {
    if (currentPetImages.length <= 1) {
        alert('至少需要保留一張圖片！');
        return;
    }

    if (confirm('確定要刪除這張圖片嗎？')) {
        currentPetImages.splice(index, 1);

        // 重新顯示圖片
        const pet = { images: currentPetImages };
        displayExistingImages(pet);

        showNotification('圖片已標記為刪除，請點擊"更新寵物"保存變更', 'info');
    }
}

// 拖拽排序功能
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedElement) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        // 交換圖片位置
        [currentPetImages[draggedIndex], currentPetImages[targetIndex]] =
        [currentPetImages[targetIndex], currentPetImages[draggedIndex]];

        // 重新顯示
        const pet = { images: currentPetImages };
        displayExistingImages(pet);

        showNotification('圖片順序已調整，請點擊"更新寵物"保存變更', 'info');
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedElement = null;
}