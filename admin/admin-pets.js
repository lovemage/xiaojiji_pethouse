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
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 儲存寵物資料
if (document.getElementById('petForm')) {
    document.getElementById('petForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const pets = JSON.parse(localStorage.getItem('pets') || '[]');
            
            // 生成新的 ID
            const newId = pets.length > 0 ? Math.max(...pets.map(p => p.id)) + 1 : 1;
            
            // 處理圖片預覽（因為無法實際上傳，使用預設圖片）
            const imageFiles = document.getElementById('petImages').files;
            const images = [];
            if (imageFiles.length > 0) {
                // 在實際應用中，這裡會上傳圖片並獲得 URL
                // 目前使用預設圖片
                images.push('../images/64805.jpg');
            }
            
            const newPet = {
                id: newId,
                name: formData.get('name'),
                breed: formData.get('breed'),
                birthdate: formData.get('birthdate'),
                age: formData.get('age'),
                gender: formData.get('gender'),
                color: formData.get('color'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                health: formData.get('health'),
                images: images,
                createdAt: new Date().toISOString()
            };
            
            pets.push(newPet);
            localStorage.setItem('pets', JSON.stringify(pets));
            
            alert('寵物資料已儲存！');
            window.location.href = 'pets.html';
        } catch (error) {
            console.error('儲存寵物資料失敗:', error);
            alert('儲存失敗，請稍後再試。');
        }
    });
}

// 載入寵物列表
function loadPets() {
    try {
        const pets = JSON.parse(localStorage.getItem('pets') || '[]');
        const tbody = document.getElementById('petsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        pets.forEach(pet => {
            const tr = document.createElement('tr');
            const imageUrl = pet.images && pet.images.length > 0 ? pet.images[0] : '../images/64805.jpg';
            
            tr.innerHTML = `
                <td>
                    <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${pet.name}</td>
                <td>${pet.breed}</td>
                <td>${pet.age}</td>
                <td>${pet.gender === 'male' ? '公犬' : '母犬'}</td>
                <td>NT$ ${parseInt(pet.price).toLocaleString()}</td>
                <td>
                    <div class="table-actions">
                        <a href="edit-pet.html?id=${pet.id}" class="btn-edit">編輯</a>
                        <button onclick="deletePet(${pet.id})" class="btn-delete">刪除</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('載入寵物列表失敗:', error);
    }
}

// 刪除寵物
function deletePet(id) {
    if (confirm('確定要刪除這隻寵物嗎？')) {
        try {
            const pets = JSON.parse(localStorage.getItem('pets') || '[]');
            const updatedPets = pets.filter(pet => pet.id !== id);
            localStorage.setItem('pets', JSON.stringify(updatedPets));
            loadPets();
            alert('寵物已刪除！');
        } catch (error) {
            console.error('刪除寵物失敗:', error);
            alert('刪除失敗，請稍後再試。');
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
                    <td>${pet.age}</td>
                    <td>NT$ ${parseInt(pet.price).toLocaleString()}</td>
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

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    initializePetsData(); // 載入預設寵物資料
    loadPets();
    loadDashboardStats();
});