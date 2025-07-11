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
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// 初始化分類篩選（頁面載入時調用）
document.addEventListener('DOMContentLoaded', () => {
    initializeCategoryFilters();
    initializeGallery(); // 初始化相簿功能
    loadGalleryImages(); // 載入相簿圖片
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

// 載入寵物資料
async function loadPetsFromStorage() {
    try {
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
                const imageUrl = images.length > 0 ? images[0] : 'images/64805.jpg';
                
                dogCard.innerHTML = `
                    <img src="${imageUrl}" alt="${pet.name}">
                    <div class="dog-info">
                        <h3>${pet.name}</h3>
                        <p>${pet.breed} | ${pet.age} | ${pet.gender === 'male' ? '公犬' : '母犬'}</p>
                        <p class="category-tag">${categoryName}</p>
                        <p class="price">NT$ ${parseInt(pet.price).toLocaleString()}</p>
                        <a href="#" class="btn-secondary" onclick="showPetDetails(${pet.id})">了解更多</a>
                    </div>
                `;
                
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
                    <p><strong>年齡：</strong>${pet.age}</p>
                    <p><strong>性別：</strong>${pet.gender === 'male' ? '公犬' : '母犬'}</p>
                    <p><strong>毛色：</strong>${pet.color}</p>
                    <p><strong>價格：</strong>NT$ ${parseInt(pet.price).toLocaleString()}</p>
                    <p><strong>描述：</strong>${pet.description}</p>
                    <p><strong>健康資訊：</strong>${pet.health}</p>
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
                        <img src="${imageUrl}" alt="${pet.name}" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                    </div>
                    <h2>${pet.name}</h2>
                    <div class="modal-info">
                        <p><strong>品種：</strong>${pet.breed}</p>
                        <p><strong>年齡：</strong>${pet.age}</p>
                        <p><strong>性別：</strong>${pet.gender === 'male' ? '公犬' : '母犬'}</p>
                        <p><strong>毛色：</strong>${pet.color}</p>
                        <p><strong>價格：</strong>NT$ ${parseInt(pet.price).toLocaleString()}</p>
                        <p><strong>描述：</strong>${pet.description}</p>
                        <p><strong>健康資訊：</strong>${pet.health || '請聯絡我們了解更多'}</p>
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
    
    // 關閉燈箱
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
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
    const activeCategory = document.querySelector('.gallery-category-btn.active').dataset.category;
    
    if (activeCategory === 'all') {
        return galleryImages;
    } else {
        return galleryImages.filter(img => img.category === activeCategory);
    }
}

// 載入相簿圖片（從資料庫 API 獲取與 admin 同步的資料）
async function loadGalleryImages() {
    try {
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