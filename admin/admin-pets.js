// 寵物管理系統
let pets = [];

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
    document.getElementById('petForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            
            // 發送到後端 API
            await API.createPet(formData);
            
            alert('寵物資料已儲存！');
            window.location.href = 'pets.html';
        } catch (error) {
            console.error('儲存寵物資料失敗:', error);
            alert('儲存失敗，請稍後再試。');
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
            const images = pet.images ? JSON.parse(pet.images) : [];
            const imageUrl = images.length > 0 ? images[0] : '../images/64805.jpg';
            
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
async function deletePet(id) {
    if (confirm('確定要刪除這隻寵物嗎？')) {
        try {
            await API.deletePet(id);
            loadPets();
        } catch (error) {
            console.error('刪除寵物失敗:', error);
            alert('刪除失敗，請稍後再試。');
        }
    }
}

// 載入儀表板統計
async function loadDashboardStats() {
    try {
        const pets = await API.getPets();
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
                const images = pet.images ? JSON.parse(pet.images) : [];
                const imageUrl = images.length > 0 ? images[0] : '../images/64805.jpg';
                
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
    loadPets();
    loadDashboardStats();
});