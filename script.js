// 全域變數 - 顯示設定
let displaySettings = {
    showName: false,
    showBreed: true,
    showAge: false,
    showGender: false,
    showPrice: false,
    showColor: true,
    showDescription: false,
    showHealth: false
};

// 手機版導航選單開關
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // 動畫效果
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translateY(7px)' : '';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translateY(-7px)' : '';
});

// 點擊選單項目後關閉選單
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        // 只有在點擊最終連結時才關閉選單
        const isDropdownToggle = link.classList.contains('dropdown-toggle');
        const isSubmenuParent = link.closest('.dropdown-submenu') && link.querySelector('.submenu-arrow');
        const isInSubmenu = link.closest('.submenu-items');
        
        // 如果是下拉切換或子菜單父項，不關閉選單
        if (!isDropdownToggle && !isSubmenuParent) {
            // 如果在子菜單項目中（最終連結），關閉選單
            if (isInSubmenu || !link.closest('.dropdown-menu')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

// 處理移動端下拉菜單
function initializeMobileDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const submenuToggles = document.querySelectorAll('.dropdown-submenu > a');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                const dropdown = toggle.closest('.nav-dropdown');
                dropdown.classList.toggle('active');
            }
        });
    });
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const submenu = toggle.closest('.dropdown-submenu');
                submenu.classList.toggle('active');
            }
        });
    });
}

// 在 DOMContentLoaded 時初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileDropdowns();
});

// 初始化分類篩選（頁面載入時調用）
document.addEventListener('DOMContentLoaded', () => {
    // 載入顯示設定
    loadFrontendDisplaySettings();
    
    // 檢查是否為首頁
    if (document.getElementById('randomDogsGrid')) {
        initializeRandomPetsDisplay();
    }

    initializeCategoryFilters();
    initializeGallery(); // 初始化相簿功能
    loadGalleryImages(); // 載入相簿圖片
    loadNavigationSettings(); // 載入導航設定

});

// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 表單提交處理
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 獲取表單數據
        const formData = new FormData(contactForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // 這裡可以添加實際的表單提交邏輯
        alert('感謝您的諮詢！我們會盡快與您聯繫。');
        contactForm.reset();
    });
}

// 滾動時導航欄效果
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.7)';
        navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.5)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.5)';
        navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
    }
    
    lastScroll = currentScroll;
});

// 監聽管理員設定更新
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'displaySettingsUpdated') {
        // 更新顯示設定
        const settings = event.data.data;
        displaySettings = {
            showName: settings.show_name === true,
            showBreed: settings.show_breed === true,
            showAge: settings.show_age === true,
            showGender: settings.show_gender === true,
            showPrice: settings.show_price === true,
            showColor: settings.show_color !== false,
            showDescription: settings.show_description === true,
            showHealth: settings.show_health === true
        };
        
        // 更新localStorage中的設定
        localStorage.setItem('frontendDisplaySettings', JSON.stringify(displaySettings));
        
        // 重新載入所有頁面的寵物卡片
        if (typeof initializeRandomPetsDisplay === 'function' && document.getElementById('randomDogsGrid')) {
            initializeRandomPetsDisplay();
        }
        if (typeof initializeLargeDogsPage === 'function' && document.getElementById('largeDogsGrid')) {
            initializeLargeDogsPage();
        }
        if (typeof initializeMediumDogsPage === 'function' && document.getElementById('mediumDogsGrid')) {
            initializeMediumDogsPage();
        }
        if (typeof initializeSmallDogsPage === 'function' && document.getElementById('smallDogsGrid')) {
            initializeSmallDogsPage();
        }
        
        console.log('前台顯示設定已更新');
    } else if (event.data && event.data.type === 'previewDisplaySettings') {
        // 預覽模式，臨時應用設定
        previewDisplaySettings(event.data.settings);
    }
});

// 預覽顯示設定
async function previewDisplaySettings(settings) {
    // 添加預覽提示
    showPreviewNotification();
    
    // 臨時應用設定
    const originalSettings = await loadFrontendDisplaySettings();
    
    // 重新生成卡片
    regeneratePetCards(settings);
    
    // 10秒後恢復原設定
    setTimeout(() => {
        regeneratePetCards(originalSettings);
        hidePreviewNotification();
    }, 10000);
}

// 重新生成寵物卡片
async function regeneratePetCards(settings) {
    try {
        const pets = await API.getPets();
        const dogsGrid = document.querySelector('.dogs-grid');
        
        if (pets.length > 0 && dogsGrid) {
            dogsGrid.innerHTML = '';
            
            pets.forEach(pet => {
                const dogCard = document.createElement('div');
                dogCard.className = 'dog-card';
                dogCard.dataset.category = `${pet.category} ${pet.gender}`;
                
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
                const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';
                
                dogCard.innerHTML = generatePetCardHTML(pet, imageUrl, settings);
                dogsGrid.appendChild(dogCard);
            });
            
            initializeCategoryFilters();
        }
    } catch (error) {
        console.error('重新生成寵物卡片失敗:', error);
    }
}

// 顯示預覽通知
function showPreviewNotification() {
    // 移除現有通知
    const existing = document.getElementById('previewNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'previewNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-eye"></i> 預覽模式
        <div style="font-size: 12px; margin-top: 5px;">10秒後自動恢復原設定</div>
    `;
    
    document.body.appendChild(notification);
    
    // 添加動畫樣式
    if (!document.getElementById('previewAnimationStyles')) {
        const style = document.createElement('style');
        style.id = 'previewAnimationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 隱藏預覽通知
function hidePreviewNotification() {
    const notification = document.getElementById('previewNotification');
    if (notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }
}

// 載入寵物資料
async function loadPetsFromStorage() {
    try {
        // 載入顯示設定
        await loadFrontendDisplaySettings();
        
        // 從資料庫 API 載入寵物資料
        const pets = await API.getPets();
        const dogsGrid = document.querySelector('.dogs-grid');
        
        if (pets.length > 0 && dogsGrid) {
            // 清空現有的示範資料
            dogsGrid.innerHTML = '';
            
            // 顯示資料庫中的寵物資料
            pets.forEach(pet => {
                const dogCard = document.createElement('div');
                dogCard.className = 'dog-card';
                dogCard.dataset.category = `${pet.category} ${pet.gender}`;
                
                // 犬型中文名稱
                const categoryName = {
                    small: '小型犬',
                    medium: '中型犬',
                    large: '大型犬'
                }[pet.category] || '';
                
                // 處理圖片
                let images = [];
                if (pet.images) {
                    if (typeof pet.images === 'string') {
                        try {
                            images = JSON.parse(pet.images);
                        } catch (e) {
                            // 如果不是 JSON 格式，當作單個圖片路徑
                            images = [pet.images];
                        }
                    } else if (Array.isArray(pet.images)) {
                        images = pet.images;
                    }
                }
                // 支援 Base64 格式（以 data: 開頭）和 URL 格式
                const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';
                
                // 根據管理員設定動態生成卡片內容
                dogCard.innerHTML = generatePetCardHTML(pet, imageUrl, displaySettings);
                
                dogsGrid.appendChild(dogCard);
            });
            
            // 重新初始化分類按鈕事件
            initializeCategoryFilters();
        } else {
            // 如果沒有寵物資料，為靜態卡片添加點擊事件
            initializeStaticPetCards();
        }
    } catch (error) {
        console.error('載入寵物資料失敗:', error);
        // 如果載入失敗，也初始化靜態卡片
        initializeStaticPetCards();
    }
}

// 載入前台顯示設定
async function loadFrontendDisplaySettings() {
    const defaultSettings = {
        showName: false,
        showBreed: true,
        showDescription: false,
        showAge: false,
        showGender: false,
        showPrice: false,
        showHealth: false,
        showColor: true
    };

    try {
        // 優先從 API 載入設定
        const response = await fetch('/api/settings');
        const settings = await response.json();

        displaySettings = {
            showName: settings.show_name === true,
            showBreed: settings.show_breed === true,
            showDescription: settings.show_description === true,
            showAge: settings.show_age === true,
            showGender: settings.show_gender === true,
            showPrice: settings.show_price === true,
            showHealth: settings.show_health === true,
            showColor: settings.show_color === true
        };

        return displaySettings;
    } catch (error) {
        console.error('從 API 載入顯示設定失敗，使用預設設定:', error);

        // API 失敗時嘗試從 localStorage 載入
        try {
            const saved = localStorage.getItem('frontendDisplaySettings');
            if (saved) {
                displaySettings = { ...defaultSettings, ...JSON.parse(saved) };
            } else {
                displaySettings = defaultSettings;
            }
        } catch (localError) {
            console.error('載入本地顯示設定失敗:', localError);
            displaySettings = defaultSettings;
        }

        return displaySettings;
    }
}

// 生成寵物卡片HTML
function generatePetCardHTML(pet, imageUrl, settings) {
    let cardContent = `<img src="${imageUrl}" alt="${pet.name}">`;
    cardContent += `<div class="dog-info">`;
    
    // 寵物名稱
    if (settings.showName) {
        cardContent += `<h3>${pet.name}</h3>`;
    }
    
    // 品種
    if (settings.showBreed) {
        cardContent += `<p class="breed">${pet.breed}</p>`;
    }
    
    // 年齡
    if (settings.showAge && pet.age) {
        cardContent += `<p class="age">年齡：${pet.age}</p>`;
    }
    
    // 性別
    if (settings.showGender) {
        const genderText = pet.gender === 'male' ? '公犬' : '母犬';
        cardContent += `<p class="gender">性別：${genderText}</p>`;
    }
    
    // 毛色
    if (settings.showColor && pet.color) {
        cardContent += `<p class="color">毛色：${pet.color}</p>`;
    }
    
    // 價格
    if (settings.showPrice && pet.price) {
        cardContent += `<p class="price">NT$ ${parseInt(pet.price).toLocaleString()}</p>`;
    }
    
    // 描述
    if (settings.showDescription) {
        cardContent += `<p class="description">${pet.description}</p>`;
    }
    
    // 健康資訊
    if (settings.showHealth && pet.health) {
        cardContent += `<p class="health">健康：${pet.health}</p>`;
    }
    
    cardContent += `<a href="#" class="btn-secondary" onclick="showPetDetails(${pet.id})">
        <i class="fas fa-paw"></i> 了解更多
    </a>`;
    cardContent += `</div>`;
    
    return cardContent;
}

// 初始化靜態寵物卡片的點擊事件
function initializeStaticPetCards() {
    const staticPetData = [
        {
            id: 'static-1',
            name: '小黑',
            breed: '邊境牧羊犬',
            age: '3個月大',
            gender: 'male',
            color: '黑白色',
            price: 35000,
            description: '活潑聰明的邊境牧羊犬幼犬，已完成基礎疫苗接種，個性溫和親人，適合家庭飼養。',
            health: '已完成六合一疫苗、狂犬病疫苗接種，定期健康檢查，健康狀況良好。',
            image: 'images/64805.jpg'
        },
        {
            id: 'static-2',
            name: '小花',
            breed: '柯基犬',
            age: '2個月大',
            gender: 'female',
            color: '三色',
            price: 38000,
            description: '可愛的柯基犬幼犬，短腿萌萌的外型深受喜愛，個性活潑好動。',
            health: '已完成基礎疫苗接種，健康檢查報告良好，無遺傳疾病。',
            image: 'images/download.jpg'
        },
        {
            id: 'static-3',
            name: '露西',
            breed: '黃金獵犬',
            age: '4個月大',
            gender: 'female',
            color: '金黃色',
            price: 45000,
            description: '溫順友善的黃金獵犬，非常適合與小朋友相處，是最佳的家庭伴侶犬。',
            health: '完整疫苗接種記錄，定期獸醫健檢，健康狀況優良。',
            image: 'images/download-1.jpg'
        },
        {
            id: 'static-4',
            name: '小白',
            breed: '柴犬',
            age: '4個月大',
            gender: 'male',
            color: '白色',
            price: 32000,
            description: '聰明活潑的柴犬，忠誠度高，是很好的看家犬，同時也很親人。',
            health: '已完成所有必要疫苗接種，健康檢查報告完整，品質保證。',
            image: 'images/download-2.jpg'
        }
    ];

    // 為每個靜態寵物卡片添加點擊事件
    const dogCards = document.querySelectorAll('.dog-card');
    dogCards.forEach((card, index) => {
        const btn = card.querySelector('.btn-secondary');
        if (btn && staticPetData[index]) {
            btn.onclick = (e) => {
                e.preventDefault();
                showStaticPetDetails(staticPetData[index]);
            };
        }
    });
}

// 顯示靜態寵物詳細資訊
function showStaticPetDetails(pet) {
    try {
        // 建立詳細資訊視窗
        const modal = document.createElement('div');
        modal.className = 'pet-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-pet-image">
                    <img src="${pet.image}" alt="${pet.name}" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                </div>
                <h2>${pet.name}</h2>
                <div class="modal-info">
                    <p><strong>品種：</strong>${pet.breed}</p>
                    <p><strong>描述：</strong>${pet.description}</p>
                    <div class="contact-info">
                        <p><strong>詳細資訊請聯絡我們：</strong></p>
                        <p>📞 電話：0910-808-283</p>
                        <p>📱 LINE：@corgidog</p>
                        <p>🕒 營業時間：下午13:00 ~ 晚上21:00</p>
                    </div>
                </div>
                <div class="modal-contact">
                    <h3>有興趣嗎？立即聯絡我們！</h3>
                    <a href="https://lin.ee/kWyAbbF" target="_blank" class="btn-primary">
                        <i class="fab fa-line"></i> LINE 聯絡
                    </a>
                    <p>或撥打電話：0910-808-283</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 關閉按鈕
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
        };
        
        // 點擊背景關閉
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    } catch (error) {
        console.error('顯示寵物詳細資料失敗:', error);
    }
}

// 顯示寵物詳細資訊 (資料庫版本)
async function showPetDetails(petId) {
    try {
        // 從資料庫 API 載入寵物資料
        const pets = await API.getPets();
        const pet = pets.find(p => p.id === petId);
        
        if (pet) {
            // 處理圖片
            let images = [];
            if (pet.images) {
                if (typeof pet.images === 'string') {
                    try {
                        images = JSON.parse(pet.images);
                    } catch (e) {
                        // 如果不是 JSON 格式，當作單個圖片路徑
                        images = [pet.images];
                    }
                } else if (Array.isArray(pet.images)) {
                    images = pet.images;
                }
            }
            const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';
            
            // 建立詳細資訊視窗
            const modal = document.createElement('div');
            modal.className = 'pet-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-pet-image">
                        <img src="${imageUrl}" alt="寵物照片" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                    </div>
                    <h2>各式品種幼犬出售</h2>
                    <div class="modal-info">
                        <div class="pet-basic-info">
                            <p><strong>品種：</strong>${pet.breed}</p>
                            ${pet.color ? `<p><strong>毛色：</strong>${pet.color}</p>` : ''}
                        </div>

                        <div class="service-highlights">
                            <h3>🎉 優惠服務</h3>
                            <ul>
                                <li>✅ 全面批發價，價錢優惠</li>
                                <li>💳 提供刷卡分期服務</li>
                                <li>📱 街口支付</li>
                                <li>💰 線上可辦現金分期（免卡分期）</li>
                                <li>⚡ 快速過件無負擔 讓你沒壓力帶寶貝回家喔</li>
                            </ul>
                        </div>

                        <div class="service-guarantee">
                            <h3>🏆 品質保證</h3>
                            <ul>
                                <li>🚚 全省可運送</li>
                                <li>🐛 已完成驅蟲</li>
                                <li>💉 已打第一劑預防針</li>
                                <li>📋 合法來源、契約保障</li>
                                <li>🏠 環境明亮乾淨、定時消毒清潔</li>
                                <li>👨‍⚕️ 售前售後專業飼養諮詢</li>
                                <li>❤️ 讓各位飼主安心飼養</li>
                            </ul>
                        </div>

                        <div class="license-info">
                            <p><strong>🏅 特寵業字第W1141071號</strong></p>
                        </div>

                        <div class="contact-info">
                            <h3>📞 聯絡方式</h3>
                            <p>📱 LINE：@corgidog</p>
                            <p>🕒 營業時間：下午13:00 ~ 晚上21:00</p>
                        </div>
                    </div>
                    <div class="modal-contact">
                        <h3>有興趣嗎？立即聯絡我們！</h3>
                        <a href="https://lin.ee/kWyAbbF" target="_blank" class="btn-primary">
                            <i class="fab fa-line"></i> LINE 聯絡
                        </a>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 關閉按鈕
            modal.querySelector('.close-modal').onclick = () => {
                modal.remove();
            };
            
            // 點擊背景關閉
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            };
        }
    } catch (error) {
        console.error('載入寵物詳細資料失敗:', error);
    }
}

// 顯示疫苗接種詳細資訊
function showVaccineInfo() {
    const modal = document.createElement('div');
    modal.className = 'pet-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="fas fa-syringe"></i>
                </div>
                <h2>疫苗接種詳細資訊</h2>
            </div>
            <div class="modal-body">
                <div class="vaccine-schedule">
                    <h3><i class="fas fa-calendar-alt"></i> 疫苗接種時程表</h3>
                    <div class="vaccine-timeline">
                        <div class="vaccine-item">
                            <div class="vaccine-age">6-8週</div>
                            <div class="vaccine-info">
                                <h4>第一劑六合一疫苗</h4>
                                <p>預防犬瘟熱、腺病毒、副流感、細小病毒、冠狀病毒、鉤端螺旋體</p>
                            </div>
                        </div>
                        <div class="vaccine-item">
                            <div class="vaccine-age">10-12週</div>
                            <div class="vaccine-info">
                                <h4>第二劑六合一疫苗</h4>
                                <p>加強免疫效果，確保抗體充足</p>
                            </div>
                        </div>
                        <div class="vaccine-item">
                            <div class="vaccine-age">14-16週</div>
                            <div class="vaccine-info">
                                <h4>第三劑六合一疫苗 + 狂犬病疫苗</h4>
                                <p>完成基礎免疫，符合法規要求</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="vaccine-benefits">
                    <h3><i class="fas fa-shield-virus"></i> 疫苗保護效果</h3>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-virus-slash"></i>
                            <h4>犬瘟熱</h4>
                            <p>預防致命性病毒感染</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-heartbeat"></i>
                            <h4>細小病毒</h4>
                            <p>預防腸胃道嚴重疾病</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-lungs-virus"></i>
                            <h4>副流感</h4>
                            <p>預防呼吸道感染</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-dna"></i>
                            <h4>腺病毒</h4>
                            <p>預防肝炎和呼吸道疾病</p>
                        </div>
                    </div>
                </div>
                
                <div class="vaccine-guarantee">
                    <h3><i class="fas fa-certificate"></i> 我們的保證</h3>
                    <ul>
                        <li><i class="fas fa-check-circle"></i> 使用原廠進口疫苗</li>
                        <li><i class="fas fa-check-circle"></i> 專業獸醫師施打</li>
                        <li><i class="fas fa-check-circle"></i> 完整疫苗記錄卡</li>
                        <li><i class="fas fa-check-circle"></i> 疫苗反應追蹤服務</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <a href="pet-health.html" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i>
                    查看完整健康資訊
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 點擊背景關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 顯示健康手冊詳細資訊
function showHealthHandbookInfo() {
    const modal = document.createElement('div');
    modal.className = 'pet-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="fas fa-book-medical"></i>
                </div>
                <h2>健康手冊詳細內容</h2>
            </div>
            <div class="modal-body">
                <div class="handbook-contents">
                    <h3><i class="fas fa-list-ul"></i> 健康手冊包含內容</h3>
                    <div class="handbook-sections">
                        <div class="handbook-section">
                            <div class="section-icon">
                                <i class="fas fa-syringe"></i>
                            </div>
                            <div class="section-content">
                                <h4>疫苗接種記錄</h4>
                                <p>完整的疫苗接種時間、種類、批號記錄</p>
                                <ul>
                                    <li>六合一疫苗接種證明</li>
                                    <li>狂犬病疫苗接種證明</li>
                                    <li>疫苗有效期限提醒</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="handbook-section">
                            <div class="section-icon">
                                <i class="fas fa-stethoscope"></i>
                            </div>
                            <div class="section-content">
                                <h4>健康檢查記錄</h4>
                                <p>專業獸醫師的詳細健康檢查報告</p>
                                <ul>
                                    <li>心肺功能檢查</li>
                                    <li>眼耳口鼻檢查</li>
                                    <li>皮膚毛髮狀況</li>
                                    <li>體重發育評估</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="handbook-section">
                            <div class="section-icon">
                                <i class="fas fa-utensils"></i>
                            </div>
                            <div class="section-content">
                                <h4>飲食建議指南</h4>
                                <p>專業的飲食建議和餵養指導</p>
                                <ul>
                                    <li>年齡階段飲食建議</li>
                                    <li>推薦飼料品牌</li>
                                    <li>餵食份量計算</li>
                                    <li>禁忌食物清單</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="handbook-section">
                            <div class="section-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="section-content">
                                <h4>訓練照護指南</h4>
                                <p>基礎訓練和日常照護要點</p>
                                <ul>
                                    <li>基本服從訓練</li>
                                    <li>社會化訓練建議</li>
                                    <li>日常清潔護理</li>
                                    <li>運動需求建議</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="support-service">
                    <h3><i class="fas fa-headset"></i> 終身諮詢服務</h3>
                    <div class="service-features">
                        <div class="service-item">
                            <i class="fab fa-line"></i>
                            <div>
                                <h4>LINE 即時諮詢</h4>
                                <p>24小時內回覆您的問題</p>
                            </div>
                        </div>
                        <div class="service-item">
                            <i class="fas fa-phone"></i>
                            <div>
                                <h4>電話諮詢服務</h4>
                                <p>營業時間內專人服務</p>
                            </div>
                        </div>
                        <div class="service-item">
                            <i class="fas fa-calendar-check"></i>
                            <div>
                                <h4>定期關懷追蹤</h4>
                                <p>主動關心狗狗成長狀況</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <a href="adoption-guide.html" class="btn-primary">
                    <i class="fas fa-book-open"></i>
                    查看完整領養指南
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 點擊背景關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 初始化分類篩選功能
function initializeCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const dogCards = document.querySelectorAll('.dog-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按鈕狀態
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            // 篩選顯示
            dogCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    if (card.dataset.category.includes(category)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

// 圖片懶加載（如果需要的話）
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

// 觀察所有圖片
document.querySelectorAll('img').forEach(img => {
    imageObserver.observe(img);
});

// 為圖片添加載入動畫
document.querySelectorAll('.dog-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease';
});

// 載入網站設定
async function loadSiteSettings() {
    try {
        // 從資料庫 API 載入網站設定
        const settings = await API.getSettings();
        
        // 更新頁面標題
        if (settings.site_title) {
            document.title = settings.site_title + ' - ' + (settings.site_description || '專業寵物犬舍');
            // 更新導航欄標題
            const navTitle = document.querySelector('.nav-brand h1');
            if (navTitle) navTitle.textContent = settings.site_title;
        }
        
        // 更新聯絡資訊
        if (settings.contact_phone) {
            // 更新頂部聯絡資訊
            const phoneElements = document.querySelectorAll('.contact-info .fa-phone');
            phoneElements.forEach(el => {
                const phoneSpan = el.parentElement;
                if (phoneSpan) phoneSpan.innerHTML = `<i class="fas fa-phone"></i> ${settings.contact_phone}`;
            });
            
            // 更新聯絡頁面的電話
            const contactPhoneElements = document.querySelectorAll('.contact-list .fa-phone');
            contactPhoneElements.forEach(el => {
                const phoneItem = el.parentElement;
                if (phoneItem) phoneItem.innerHTML = `<i class="fas fa-phone"></i> ${settings.contact_phone}`;
            });
        }
        
        // 更新 LINE ID
        if (settings.contact_line) {
            const lineElements = document.querySelectorAll('.contact-info .fa-line');
            lineElements.forEach(el => {
                const lineSpan = el.parentElement;
                if (lineSpan) lineSpan.innerHTML = `<i class="fab fa-line"></i> ${settings.contact_line}`;
            });
        }
        
        // 更新營業時間
        if (settings.business_hours) {
            const hoursElements = document.querySelectorAll('.contact-info .fa-clock');
            hoursElements.forEach(el => {
                const hoursSpan = el.parentElement;
                if (hoursSpan) hoursSpan.innerHTML = `<i class="fas fa-clock"></i> ${settings.business_hours}`;
            });
            
            // 更新聯絡頁面的營業時間
            const contactHoursElements = document.querySelectorAll('.contact-list .fa-clock');
            contactHoursElements.forEach(el => {
                const hoursItem = el.parentElement;
                if (hoursItem) hoursItem.innerHTML = `<i class="fas fa-clock"></i> 營業時間：${settings.business_hours}`;
            });
        }
        
        // 更新地址
        if (settings.contact_address) {
            const addressElements = document.querySelectorAll('.contact-list .fa-map-marker-alt');
            addressElements.forEach(el => {
                const addressItem = el.parentElement;
                if (addressItem) addressItem.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settings.contact_address}`;
            });
    }
    
        // 更新執照資訊
        if (settings.license_number) {
            const licenseElements = document.querySelectorAll('.license-info p');
            if (licenseElements.length > 0) {
                licenseElements[0].innerHTML = `<strong>${settings.license_number}</strong>`;
            }
        }
        
        if (settings.tax_id) {
            const taxElements = document.querySelectorAll('.license-info p');
            if (taxElements.length > 1) {
                taxElements[1].textContent = `統一編號：${settings.tax_id}`;
            }
        }
        
        console.log('網站設定載入完成');
    } catch (error) {
        console.error('載入網站設定失敗:', error);
    }
}

// 載入公告
async function loadAnnouncements() {
    try {
        // 從資料庫 API 載入啟用的公告
        const announcements = await API.getAnnouncements(true);
        
        if (announcements.length > 0) {
            // 顯示第一個公告
            const announcement = announcements[0];
            showAnnouncement({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type,
                enabled: true
            });
        }
    } catch (error) {
        console.error('載入公告失敗:', error);
    }
}

// 顯示公告
function showAnnouncement(announcement) {
    const announcementHtml = `
        <div class="announcement-bar announcement-${announcement.type}">
            <div class="container">
                <div class="announcement-content">
                    <strong>${announcement.title}</strong>
                    <span>${announcement.content}</span>
                    ${announcement.link ? `<a href="${announcement.link}" target="_blank">了解更多</a>` : ''}
                </div>
                <button class="announcement-close" onclick="closeAnnouncement()">×</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', announcementHtml);
}

// 關閉公告
function closeAnnouncement() {
    const announcementBar = document.querySelector('.announcement-bar');
    if (announcementBar) {
        announcementBar.remove();
    }
}

// 社群媒體選單開關
function toggleSocialMenu() {
    const socialMenu = document.querySelector('.social-float-menu');
    socialMenu.classList.toggle('active');
}

// 載入客戶評價
async function loadTestimonials() {
    try {
        // 從資料庫 API 載入客戶評價
        const testimonials = await API.getTestimonials();
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        
        if (testimonials.length > 0 && testimonialsGrid) {
            // 清空現有評價
            testimonialsGrid.innerHTML = '';
            
            // 只顯示啟用的評價
            const activeTestimonials = testimonials.filter(t => t.is_active);
            
            activeTestimonials.forEach(testimonial => {
                const testimonialCard = document.createElement('div');
                testimonialCard.className = 'testimonial-card';
                
                testimonialCard.innerHTML = `
                    <div class="stars">
                        ${generateStars(testimonial.rating)}
                    </div>
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.avatar || 'images/64805.jpg'}" alt="客戶照片" class="author-img">
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.pet_type || '寵物主人'}</p>
                        </div>
                    </div>
                `;
                
                testimonialsGrid.appendChild(testimonialCard);
            });
        }
    } catch (error) {
        console.error('載入客戶評價失敗:', error);
        // 如果載入失敗，保持原有的靜態評價顯示
    }
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

// 隱藏管理員入口功能
let adminClickCount = 0;
let adminClickTimer = null;

function initAdminAccess() {
    const adminLogo = document.getElementById('adminLogo');
    if (adminLogo) {
        adminLogo.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            adminClickCount++;
            
            // 清除之前的計時器
            if (adminClickTimer) {
                clearTimeout(adminClickTimer);
            }
            
            // 設定新的計時器，3秒後重置點擊次數
            adminClickTimer = setTimeout(() => {
                adminClickCount = 0;
            }, 3000);
            
            // 如果在3秒內點擊5次，顯示管理員入口
            if (adminClickCount >= 5) {
                showAdminAccess();
                adminClickCount = 0;
            }
        });
    }
}

function showAdminAccess() {
    const modal = document.createElement('div');
    modal.className = 'admin-access-modal';
    modal.innerHTML = `
        <div class="admin-access-content">
            <div class="admin-access-header">
                <h3><i class="fas fa-shield-alt"></i> 管理員入口</h3>
                <button class="close-admin-modal" onclick="closeAdminModal()">&times;</button>
            </div>
            <div class="admin-access-body">
                <p>請選擇要進入的管理頁面：</p>
                <div class="admin-links">
                    <a href="admin/login.html" class="admin-link">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>登入管理系統</span>
                    </a>
                    <a href="admin/dashboard.html" class="admin-link">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>管理儀表板</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
        .admin-access-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .admin-access-content {
            background: white;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        }
        
        .admin-access-header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .admin-access-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .close-admin-modal {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .admin-access-body {
            padding: 30px;
        }
        
        .admin-access-body p {
            margin: 0 0 20px 0;
            color: #666;
        }
        
        .admin-links {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .admin-link {
            display: flex;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            text-decoration: none;
            color: #2c3e50;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .admin-link:hover {
            background: #e9ecef;
            border-color: #2c3e50;
            transform: translateY(-2px);
        }
        
        .admin-link i {
            font-size: 20px;
            margin-right: 12px;
            color: #2c3e50;
        }
        
        .admin-link span {
            font-weight: 500;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAdminModal();
        }
    });
}

function closeAdminModal() {
    const modal = document.querySelector('.admin-access-modal');
    if (modal) {
        modal.remove();
    }
}

// 當頁面載入完成後顯示動畫
window.addEventListener('load', () => {
    // 載入寵物資料
    loadPetsFromStorage();
    
    // 載入客戶評價
    loadTestimonials();
    
    // 初始化管理員入口
    initAdminAccess();
    
    // 確保靜態卡片有點擊事件（延遲一點確保 DOM 完全載入）
    setTimeout(() => {
        initializeStaticPetCards();
    }, 100);
    
    document.querySelectorAll('.dog-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// 相簿功能
let currentLightboxIndex = 0;
let galleryImages = [];

// 初始化相簿功能
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const categoryBtns = document.querySelectorAll('.gallery-category-btn');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    // 檢查相簿元素是否存在，如果不存在則直接返回
    if (!galleryItems.length || !lightbox) {
        return;
    }
    
    // 收集所有圖片數據
    galleryImages = Array.from(galleryItems).map(item => ({
        src: item.querySelector('img').src,
        title: item.querySelector('img').dataset.title,
        description: item.querySelector('img').dataset.description,
        category: item.dataset.category
    }));
    
    // 分類篩選功能
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按鈕狀態
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            // 篩選顯示圖片
            galleryItems.forEach((item, index) => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                    item.classList.add('visible');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('visible');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
    
    // 點擊圖片開啟燈箱
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    // 關閉燈箱（檢查元素是否存在）
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeLightboxImage(-1);
            } else if (e.key === 'ArrowRight') {
                changeLightboxImage(1);
            }
        }
    });
}

// 開啟燈箱
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('gallery-lightbox');
    const image = document.getElementById('lightbox-image');
    const title = document.getElementById('lightbox-title');
    const description = document.getElementById('lightbox-description');
    
    // 設置圖片和資訊
    image.src = galleryImages[index].src;
    image.alt = galleryImages[index].title;
    title.textContent = galleryImages[index].title;
    description.textContent = galleryImages[index].description;
    
    // 顯示燈箱
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滾動
}

// 關閉燈箱
function closeLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // 恢復滾動
}

// 切換燈箱圖片
function changeLightboxImage(direction) {
    const visibleImages = getVisibleImages();
    const currentVisibleIndex = visibleImages.findIndex(img => img.src === galleryImages[currentLightboxIndex].src);
    
    let newIndex = currentVisibleIndex + direction;
    
    if (newIndex < 0) {
        newIndex = visibleImages.length - 1;
    } else if (newIndex >= visibleImages.length) {
        newIndex = 0;
    }
    
    // 找到新圖片在原始數組中的索引
    const newImageIndex = galleryImages.findIndex(img => img.src === visibleImages[newIndex].src);
    
    if (newImageIndex !== -1) {
        currentLightboxIndex = newImageIndex;
        const image = document.getElementById('lightbox-image');
        const title = document.getElementById('lightbox-title');
        const description = document.getElementById('lightbox-description');
        
        // 添加淡入效果
        image.style.opacity = '0';
        setTimeout(() => {
            image.src = galleryImages[currentLightboxIndex].src;
            image.alt = galleryImages[currentLightboxIndex].title;
            title.textContent = galleryImages[currentLightboxIndex].title;
            description.textContent = galleryImages[currentLightboxIndex].description;
            image.style.opacity = '1';
        }, 150);
    }
}

// 獲取當前可見的圖片
function getVisibleImages() {
    const activeCategoryBtn = document.querySelector('.gallery-category-btn.active');
    
    // 如果沒有相簿按鈕，返回空數組
    if (!activeCategoryBtn) {
        return [];
    }
    
    const activeCategory = activeCategoryBtn.dataset.category;
    
    if (activeCategory === 'all') {
        return galleryImages;
    } else {
        return galleryImages.filter(img => img.category === activeCategory);
    }
}

// 載入相簿圖片（從資料庫 API 獲取與 admin 同步的資料）
async function loadGalleryImages() {
    try {
        // 檢查相簿元素是否存在，如果不存在則直接返回
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) {
            return;
        }
        
        // 從資料庫 API 載入 admin 管理的相簿資料
        const images = await API.getGalleryImages();
        
        if (images.length > 0) {
            // 更新首頁相簿顯示
            updateIndexGallery(images);
        }
        
        console.log('相簿圖片載入完成，共', images.length, '張圖片');
    } catch (error) {
        console.error('載入相簿圖片失敗:', error);
        // 如果 API 失敗，保持原有的靜態圖片顯示
        console.log('使用靜態相簿圖片');
    }
}

// 更新首頁相簿顯示
function updateIndexGallery(images) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // 清空現有內容
    galleryGrid.innerHTML = '';
    
    // 重新生成相簿項目
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.category = image.category;
        
        galleryItem.innerHTML = `
            <img src="${image.src}" alt="${image.title}" data-title="${image.title}" data-description="${image.description}">
            <div class="gallery-overlay">
                <h4>${image.title}</h4>
                <p>${image.description}</p>
            </div>
        `;
        
        galleryGrid.appendChild(galleryItem);
    });
    
    // 重新初始化相簿功能
    setTimeout(() => {
        initializeGallery();
    }, 100);
}

// ==================== 新的犬型頁面功能 ====================

// 初始化首頁隨機寵物展示
async function initializeRandomPetsDisplay() {
    try {
        const response = await fetch('/api/pets');
        const pets = await response.json();

        if (pets.length > 0) {
            // 隨機選擇五個寵物
            const randomPets = getRandomPets(pets, 5);
            displayRandomPets(randomPets);
        }
    } catch (error) {
        console.error('載入寵物資料失敗:', error);
    }
}

// 獲取隨機寵物
function getRandomPets(pets, count) {
    const shuffled = [...pets].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 顯示隨機寵物卡片
async function displayRandomPets(pets) {
    const randomDogsGrid = document.getElementById('randomDogsGrid');
    if (!randomDogsGrid) return;

    randomDogsGrid.innerHTML = '';

    // 載入最新的顯示設定
    await loadFrontendDisplaySettings();
    console.log('首頁顯示設定:', displaySettings);

    // 創建寵物卡片的函數
    function createPetCard(pet) {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';

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
        const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';

        // 根據設定生成卡片內容
        dogCard.innerHTML = generatePetCardHTML(pet, imageUrl, displaySettings);

        return dogCard;
    }

    // 創建兩組相同的卡片以實現無縫循環
    for (let i = 0; i < 2; i++) {
        pets.forEach(pet => {
            const dogCard = createPetCard(pet);
            randomDogsGrid.appendChild(dogCard);
        });
    }
}

// 生成導航列品種菜單
function generateBreedMenus(pets) {
    const categories = {
        large: new Set(),
        medium: new Set(),
        small: new Set()
    };

    // 收集各類型的品種
    pets.forEach(pet => {
        if (categories[pet.category]) {
            categories[pet.category].add(pet.breed);
        }
    });

    // 生成各類型的品種菜單
    Object.keys(categories).forEach(category => {
        const menuId = `${category}DogBreeds`;
        const menu = document.getElementById(menuId);
        if (menu && categories[category].size > 0) {
            menu.innerHTML = '';
            categories[category].forEach(breed => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${category}-dogs.html?breed=${encodeURIComponent(breed)}">${breed}</a>`;
                menu.appendChild(li);
            });
        }
    });
}

// 初始化大型犬頁面
async function initializeLargeDogsPage() {
    await initializeDogTypePage('large', 'largeDogsGrid');
}

// 初始化中型犬頁面
async function initializeMediumDogsPage() {
    await initializeDogTypePage('medium', 'mediumDogsGrid');
}

// 初始化小型犬頁面
async function initializeSmallDogsPage() {
    await initializeDogTypePage('small', 'smallDogsGrid');
}

// 通用犬型頁面初始化函數
async function initializeDogTypePage(category, gridId) {
    try {
        const response = await fetch('/api/pets');
        const allPets = await response.json();

        // 篩選指定類型的寵物
        const pets = allPets.filter(pet => pet.category === category);

        // 顯示寵物
        displayDogsByType(pets, gridId);

        // 生成品種篩選按鈕
        generateBreedFilters(pets);

        // 生成導航列品種菜單
        generateBreedMenus(allPets);

        // 初始化品種篩選功能
        initializeBreedFilters(pets, gridId);

        // 檢查 URL 參數是否有指定品種
        const urlParams = new URLSearchParams(window.location.search);
        const selectedBreed = urlParams.get('breed');
        if (selectedBreed) {
            filterByBreed(selectedBreed, pets, gridId);
        }

    } catch (error) {
        console.error('載入寵物資料失敗:', error);
        showNoPetsMessage();
    }
}

// 顯示指定類型的寵物
function displayDogsByType(pets, gridId) {
    const grid = document.getElementById(gridId);
    const noPetsMessage = document.getElementById('noPetsMessage');

    if (!grid) return;

    // 確保載入最新的顯示設定
    loadFrontendDisplaySettings();

    if (pets.length === 0) {
        grid.style.display = 'none';
        if (noPetsMessage) noPetsMessage.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    if (noPetsMessage) noPetsMessage.style.display = 'none';

    grid.innerHTML = '';

    pets.forEach(pet => {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        dogCard.dataset.breed = pet.breed;

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
        const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';

        // 使用 generatePetCardHTML 函數生成卡片內容
        dogCard.innerHTML = generatePetCardHTML(pet, imageUrl, displaySettings);

        grid.appendChild(dogCard);
    });
}

// 生成品種篩選按鈕
function generateBreedFilters(pets) {
    const breedFilters = document.getElementById('breedFilters');
    if (!breedFilters) return;

    // 收集所有品種
    const breeds = [...new Set(pets.map(pet => pet.breed))];

    // 清空現有按鈕（保留"全部品種"按鈕）
    const allButton = breedFilters.querySelector('[data-breed="all"]');
    breedFilters.innerHTML = '';
    if (allButton) {
        breedFilters.appendChild(allButton);
    }

    // 添加品種按鈕
    breeds.forEach(breed => {
        const button = document.createElement('button');
        button.className = 'breed-btn';
        button.dataset.breed = breed;
        button.textContent = breed;
        breedFilters.appendChild(button);
    });
}

// 初始化品種篩選功能
function initializeBreedFilters(pets, gridId) {
    const breedButtons = document.querySelectorAll('.breed-btn');

    breedButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按鈕的 active 類
            breedButtons.forEach(btn => btn.classList.remove('active'));
            // 添加 active 類到點擊的按鈕
            button.classList.add('active');

            const selectedBreed = button.dataset.breed;
            filterByBreed(selectedBreed, pets, gridId);
        });
    });
}

// 按品種篩選
function filterByBreed(breed, pets, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    let filteredPets;
    if (breed === 'all') {
        filteredPets = pets;
    } else {
        filteredPets = pets.filter(pet => pet.breed === breed);
    }

    displayDogsByType(filteredPets, gridId);

    // 更新品種按鈕狀態
    const breedButtons = document.querySelectorAll('.breed-btn');
    breedButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.breed === breed);
    });
}

// 顯示無寵物訊息
function showNoPetsMessage() {
    const noPetsMessage = document.getElementById('noPetsMessage');
    const grid = document.querySelector('.dogs-grid');

    if (grid) grid.style.display = 'none';
    if (noPetsMessage) noPetsMessage.style.display = 'block';
}

// 載入導航設定
async function loadNavigationSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        if (settings.navigation) {
            const navigation = typeof settings.navigation === 'string'
                ? JSON.parse(settings.navigation)
                : settings.navigation;

            // 控制寶貝相簿導航的顯示
            const galleryNavItems = document.querySelectorAll('a[href="gallery.html"], a[href="../gallery.html"]');
            galleryNavItems.forEach(item => {
                const listItem = item.closest('li');
                if (listItem) {
                    listItem.style.display = navigation.showGallery ? 'block' : 'none';
                }
            });
        } else {
            // 預設為隱藏
            const galleryNavItems = document.querySelectorAll('a[href="gallery.html"], a[href="../gallery.html"]');
            galleryNavItems.forEach(item => {
                const listItem = item.closest('li');
                if (listItem) {
                    listItem.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error('載入導航設定失敗:', error);
        // 如果 API 失敗，嘗試從 localStorage 載入
        try {
            const localSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
            if (localSettings.navigation) {
                const navigation = typeof localSettings.navigation === 'string'
                    ? JSON.parse(localSettings.navigation)
                    : localSettings.navigation;

                const galleryNavItems = document.querySelectorAll('a[href="gallery.html"], a[href="../gallery.html"]');
                galleryNavItems.forEach(item => {
                    const listItem = item.closest('li');
                    if (listItem) {
                        listItem.style.display = navigation.showGallery ? 'block' : 'none';
                    }
                });
            } else {
                // 預設為隱藏
                const galleryNavItems = document.querySelectorAll('a[href="gallery.html"], a[href="../gallery.html"]');
                galleryNavItems.forEach(item => {
                    const listItem = item.closest('li');
                    if (listItem) {
                        listItem.style.display = 'none';
                    }
                });
            }
        } catch (localError) {
            console.error('載入本地導航設定失敗:', localError);
        }
    }
}

// 監聽來自 admin 的導航設定更新
window.addEventListener('message', function(event) {
    if (event.data.type === 'navigationUpdated') {
        loadNavigationSettings();
    }
});

// 初始化下拉菜單行為
function initializeDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const subDropdowns = dropdown.querySelectorAll('.dropdown .dropdown');

        subDropdowns.forEach(subDropdown => {
            const breedMenu = subDropdown.querySelector('.breed-menu');
            if (breedMenu) {
                let hoverTimeout;

                // 滑鼠進入子菜單項目
                subDropdown.addEventListener('mouseenter', function() {
                    clearTimeout(hoverTimeout);
                    subDropdown.classList.add('show-breed-menu');
                    breedMenu.style.display = 'block';
                });

                // 滑鼠離開子菜單項目
                subDropdown.addEventListener('mouseleave', function(e) {
                    // 檢查滑鼠是否移動到品種菜單
                    const rect = breedMenu.getBoundingClientRect();
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    if (mouseX >= rect.left && mouseX <= rect.right &&
                        mouseY >= rect.top && mouseY <= rect.bottom) {
                        return; // 滑鼠在品種菜單內，不隱藏
                    }

                    hoverTimeout = setTimeout(() => {
                        subDropdown.classList.remove('show-breed-menu');
                        breedMenu.style.display = 'none';
                    }, 150);
                });

                // 滑鼠進入品種菜單
                breedMenu.addEventListener('mouseenter', function() {
                    clearTimeout(hoverTimeout);
                    subDropdown.classList.add('show-breed-menu');
                    breedMenu.style.display = 'block';
                });

                // 滑鼠離開品種菜單
                breedMenu.addEventListener('mouseleave', function() {
                    hoverTimeout = setTimeout(() => {
                        subDropdown.classList.remove('show-breed-menu');
                        breedMenu.style.display = 'none';
                    }, 150);
                });
            }
        });

        // 主下拉菜單的懸停控制
        const mainDropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (mainDropdownMenu) {
            dropdown.addEventListener('mouseleave', function() {
                // 隱藏所有子菜單
                const allSubDropdowns = dropdown.querySelectorAll('.dropdown .dropdown');
                allSubDropdowns.forEach(sub => {
                    sub.classList.remove('show-breed-menu');
                    const menu = sub.querySelector('.breed-menu');
                    if (menu) {
                        menu.style.display = 'none';
                    }
                });
            });
        }
    });
}

// 在頁面載入時初始化下拉菜單
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeDropdownMenus();
        loadBreedSubmenus(); // 載入品種子菜單
    }, 500); // 延遲執行確保所有元素都已載入
});

// 載入品種到子菜單
async function loadBreedSubmenus() {
    try {
        const response = await fetch('/api/pets');
        const pets = await response.json();
        
        // 分類品種
        const breeds = {
            large: new Set(),
            medium: new Set(),
            small: new Set()
        };
        
        pets.forEach(pet => {
            if (breeds[pet.category]) {
                breeds[pet.category].add(pet.breed);
            }
        });
        
        // 填充子菜單
        populateBreedMenu('largeDogBreeds', breeds.large, 'large');
        populateBreedMenu('mediumDogBreeds', breeds.medium, 'medium');
        populateBreedMenu('smallDogBreeds', breeds.small, 'small');
    } catch (error) {
        console.error('Error loading breed submenus:', error);
    }
}

// 填充品種菜單
function populateBreedMenu(menuId, breeds, category) {
    const menu = document.getElementById(menuId);
    if (menu && breeds.size > 0) {
        menu.innerHTML = Array.from(breeds)
            .sort()
            .map(breed => `
                <li>
                    <a href="${category}-dogs.html?breed=${encodeURIComponent(breed)}">
                        ${breed}
                    </a>
                </li>
            `).join('');
    }
}

