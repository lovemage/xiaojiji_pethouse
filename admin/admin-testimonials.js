// 客戶評價管理
let testimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');

// 如果沒有評價，載入預設評價
if (testimonials.length === 0) {
    testimonials = [
        {
            id: 1,
            name: "陳小姐",
            petType: "柯基犬主人",
            rating: 5,
            text: "從小基基帶回家的柯基寶寶超級健康活潑！老闆很細心地教導飼養方式，還提供了完整的健康記錄。寶寶現在已經成為我們家的開心果了！",
            avatar: "../images/64805.jpg",
            isActive: true
        },
        {
            id: 2,
            name: "林先生",
            petType: "黃金獵犬主人",
            rating: 5,
            text: "專業的犬舍！環境乾淨整潔，狗狗們都很健康。最感動的是售後服務，老闆會定期關心狗狗的狀況，真的把每隻狗狗都當作家人。",
            avatar: "../images/download-1.jpg",
            isActive: true
        },
        {
            id: 3,
            name: "王小姐",
            petType: "邊境牧羊犬主人",
            rating: 5,
            text: "第二次來小基基購買狗狗了！品質真的沒話說，價格公道，最重要的是狗狗們都有完整的疫苗接種記錄。推薦給想要養狗的朋友們！",
            avatar: "../images/download.jpg",
            isActive: true
        },
        {
            id: 4,
            name: "張先生",
            petType: "柴犬主人",
            rating: 5,
            text: "老闆超有耐心！第一次養狗什麼都不懂，老闆詳細解說了飲食、訓練等各種注意事項。LINE隨時都可以諮詢，真的很貼心！",
            avatar: "../images/download-2.jpg",
            isActive: true
        }
    ];
    localStorage.setItem('testimonials', JSON.stringify(testimonials));
}

// 載入評價列表
function loadTestimonials() {
    const container = document.getElementById('testimonialsList');
    container.innerHTML = '';
    
    testimonials.forEach(testimonial => {
        const card = document.createElement('div');
        card.className = 'testimonial-admin-card';
        card.innerHTML = `
            <span class="testimonial-status ${testimonial.isActive ? 'active' : 'inactive'}">
                ${testimonial.isActive ? '顯示中' : '已隱藏'}
            </span>
            <div class="testimonial-admin-header">
                <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-admin-avatar">
                <div class="testimonial-admin-info">
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.petType}</p>
                </div>
            </div>
            <div class="testimonial-admin-rating">
                ${generateStars(testimonial.rating)}
            </div>
            <p class="testimonial-admin-text">"${testimonial.text}"</p>
            <div class="testimonial-admin-actions">
                <button onclick="editTestimonial(${testimonial.id})" class="btn-edit">編輯</button>
                <button onclick="deleteTestimonial(${testimonial.id})" class="btn-delete">刪除</button>
                <button onclick="toggleTestimonial(${testimonial.id})" class="btn-secondary">
                    ${testimonial.isActive ? '隱藏' : '顯示'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 生成星星評分
function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// 開啟評價彈窗
function openTestimonialModal(testimonialId = null) {
    const modal = document.getElementById('testimonialModal');
    const form = document.getElementById('testimonialForm');
    
    form.reset();
    
    if (testimonialId) {
        const testimonial = testimonials.find(t => t.id === testimonialId);
        if (testimonial) {
            document.getElementById('modalTitle').textContent = '編輯客戶評價';
            document.getElementById('testimonialId').value = testimonial.id;
            document.getElementById('customerName').value = testimonial.name;
            document.getElementById('petType').value = testimonial.petType;
            document.getElementById('rating').value = testimonial.rating;
            document.getElementById('testimonialText').value = testimonial.text;
            document.getElementById('selectedAvatar').value = testimonial.avatar;
            document.getElementById('avatarPreview').src = testimonial.avatar;
            document.getElementById('isActive').checked = testimonial.isActive;
        }
    } else {
        document.getElementById('modalTitle').textContent = '新增客戶評價';
        document.getElementById('testimonialId').value = '';
    }
    
    modal.style.display = 'flex';
}

// 關閉評價彈窗
function closeTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'none';
}

// 編輯評價
function editTestimonial(id) {
    openTestimonialModal(id);
}

// 刪除評價
function deleteTestimonial(id) {
    if (confirm('確定要刪除這則評價嗎？')) {
        testimonials = testimonials.filter(t => t.id !== id);
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        loadTestimonials();
    }
}

// 切換評價顯示狀態
function toggleTestimonial(id) {
    const testimonial = testimonials.find(t => t.id === id);
    if (testimonial) {
        testimonial.isActive = !testimonial.isActive;
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        loadTestimonials();
    }
}

// 選擇頭像
function selectAvatar() {
    document.getElementById('avatarModal').style.display = 'flex';
}

// 關閉頭像選擇彈窗
function closeAvatarModal() {
    document.getElementById('avatarModal').style.display = 'none';
}

// 選擇頭像
function chooseAvatar(src) {
    document.getElementById('selectedAvatar').value = src;
    document.getElementById('avatarPreview').src = src;
    closeAvatarModal();
}

// 儲存評價表單
document.getElementById('testimonialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const testimonialId = document.getElementById('testimonialId').value;
    const testimonialData = {
        name: document.getElementById('customerName').value,
        petType: document.getElementById('petType').value,
        rating: parseInt(document.getElementById('rating').value),
        text: document.getElementById('testimonialText').value,
        avatar: document.getElementById('selectedAvatar').value,
        isActive: document.getElementById('isActive').checked
    };
    
    if (testimonialId) {
        // 編輯現有評價
        const index = testimonials.findIndex(t => t.id == testimonialId);
        if (index !== -1) {
            testimonials[index] = { ...testimonials[index], ...testimonialData };
        }
    } else {
        // 新增評價
        testimonialData.id = Date.now();
        testimonials.push(testimonialData);
    }
    
    localStorage.setItem('testimonials', JSON.stringify(testimonials));
    loadTestimonials();
    closeTestimonialModal();
    alert('評價已儲存！');
});

// 點擊彈窗外部關閉
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// 載入評價
document.addEventListener('DOMContentLoaded', loadTestimonials);