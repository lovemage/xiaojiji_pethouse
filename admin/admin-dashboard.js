// 儀表板功能
document.addEventListener('DOMContentLoaded', function() {
    // 載入統計資料
    loadDashboardStats();
    
    // 載入最近的寵物
    loadRecentPets();
    
    // 模擬今日瀏覽數
    const todayViews = Math.floor(Math.random() * 200) + 50;
    document.getElementById('todayViews').textContent = todayViews;
});

function loadDashboardStats() {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // 總寵物數
    document.getElementById('totalPets').textContent = pets.length;
    
    // 小型犬數量
    const smallDogCount = pets.filter(pet => pet.category === 'small').length;
    document.getElementById('puppyCount').textContent = smallDogCount;
    
    // 未讀訊息
    const unreadCount = messages.filter(msg => !msg.read).length;
    document.getElementById('unreadMessages').textContent = unreadCount;
}

function loadRecentPets() {
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    const recentPetsEl = document.getElementById('recentPets');
    
    // 取最近5隻寵物
    const recentPets = pets.slice(-5).reverse();
    
    if (recentPets.length === 0) {
        recentPetsEl.innerHTML = '<tr><td colspan="6" style="text-align: center;">尚無寵物資料</td></tr>';
        return;
    }
    
    recentPetsEl.innerHTML = '';
    recentPets.forEach(pet => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${pet.images && pet.images.length > 0 ? 
                    `<img src="${pet.images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 
                    '<span style="color: #999;">無圖片</span>'}
            </td>
            <td>${pet.name}</td>
            <td>${pet.breed}</td>
            <td>${pet.age}</td>
            <td>NT$ ${parseInt(pet.price).toLocaleString()}</td>
            <td>
                <div class="table-actions">
                    <a href="edit-pet.html?id=${pet.id}" class="btn-edit">編輯</a>
                    <button onclick="deletePet(${pet.id})" class="btn-delete">刪除</button>
                </div>
            </td>
        `;
        recentPetsEl.appendChild(tr);
    });
}

function deletePet(id) {
    if (confirm('確定要刪除這隻寵物嗎？')) {
        let pets = JSON.parse(localStorage.getItem('pets') || '[]');
        pets = pets.filter(pet => pet.id !== id);
        localStorage.setItem('pets', JSON.stringify(pets));
        loadRecentPets();
        loadDashboardStats();
    }
}