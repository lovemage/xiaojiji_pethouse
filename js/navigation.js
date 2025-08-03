// 統一導航管理組件
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // 獲取當前頁面
    getCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';
        return fileName.replace('.html', '');
    }

    // 初始化導航
    init() {
        this.createTopBar();
        this.createNavbar();
        this.createSocialFloat();
        this.setupEventListeners();
    }

    // 創建頂部聯絡資訊欄
    createTopBar() {
        const topBarHTML = `
            <div class="top-bar">
                <div class="container">
                    <div class="contact-info">
                        <span><i class="fas fa-phone"></i> 0910-808-283</span>
                        <span><i class="fab fa-line"></i> @corgidog</span>
                        <span><i class="fas fa-clock"></i> 下午13:00 ~ 晚上21:00</span>
                    </div>
                    <div class="social-links">
                        <a href="https://lin.ee/kWyAbbF" target="_blank" aria-label="Line"><i class="fab fa-line"></i></a>
                        <a href="https://www.instagram.com/corgidog666/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.tiktok.com/@corgidog114666?_t=ZS-8xwHtofNTBI&_r=1" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>
            </div>
        `;

        // 在body開頭插入頂部欄
        document.body.insertAdjacentHTML('afterbegin', topBarHTML);
    }

    // 創建導航欄
    createNavbar() {
        const navbarHTML = `
            <nav class="navbar">
                <div class="container">
                    <div class="nav-brand">
                        <a href="index.html" style="text-decoration: none;">
                            <img src="images/logo.webp" alt="小基基寵物犬舍" style="height: 50px; vertical-align: middle; margin-right: 10px;" id="adminLogo">
                            <div style="display: inline-block; vertical-align: middle;">
                                <h1 style="margin: 0; font-size: 24px;">小基基寵物犬舍</h1>
                                <span class="subtitle">特寵業字第W1141071號</span>
                            </div>
                        </a>
                    </div>
                    <button class="nav-toggle" aria-label="Toggle navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <ul class="nav-menu">
                        <li><a href="index.html" class="${this.currentPage === 'index' ? 'active' : ''}">首頁</a></li>
                        <li class="nav-dropdown">
                            <a href="#" class="dropdown-toggle">
                                <i class="material-icons">pets</i>
                                <span>幼犬出售區</span>
                                <i class="fas fa-chevron-down dropdown-arrow"></i>
                            </a>
                            <ul class="dropdown-menu">
                                <li class="dropdown-submenu">
                                    <a href="large-dogs.html">
                                        大型犬
                                        <i class="fas fa-chevron-right submenu-arrow"></i>
                                    </a>
                                    <ul class="submenu-items" id="largeDogBreeds">
                                        <!-- 大型犬品種將由 JavaScript 動態生成 -->
                                    </ul>
                                </li>
                                <li class="dropdown-submenu">
                                    <a href="medium-dogs.html">
                                        中型犬
                                        <i class="fas fa-chevron-right submenu-arrow"></i>
                                    </a>
                                    <ul class="submenu-items" id="mediumDogBreeds">
                                        <!-- 中型犬品種將由 JavaScript 動態生成 -->
                                    </ul>
                                </li>
                                <li class="dropdown-submenu">
                                    <a href="small-dogs.html">
                                        小型犬
                                        <i class="fas fa-chevron-right submenu-arrow"></i>
                                    </a>
                                    <ul class="submenu-items" id="smallDogBreeds">
                                        <!-- 小型犬品種將由 JavaScript 動態生成 -->
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li><a href="gallery.html" class="${this.currentPage === 'gallery' ? 'active' : ''}">寶貝相簿</a></li>
                        <li><a href="pet-manual.html" class="${this.currentPage === 'pet-manual' ? 'active' : ''}">寵物手冊</a></li>
                        <li><a href="contact-form.html" class="${this.currentPage === 'contact-form' ? 'active' : ''}">聯絡我們</a></li>
                    </ul>
                </div>
            </nav>
        `;

        // 在頂部欄後插入導航欄
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.insertAdjacentHTML('afterend', navbarHTML);
        }
    }

    // 創建右側固定社群按鈕
    createSocialFloat() {
        const socialFloatHTML = `
            <div class="social-float-fixed">
                <a href="https://lin.ee/kWyAbbF" target="_blank" class="social-fixed-btn line-btn" aria-label="LINE">
                    <i class="fab fa-line"></i>
                    <span class="social-tooltip">LINE</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577693613816&locale=zh_TW" target="_blank" class="social-fixed-btn facebook-btn" aria-label="Facebook">
                    <i class="fab fa-facebook-f"></i>
                    <span class="social-tooltip">Facebook</span>
                </a>
                <a href="https://youtube.com/@user-co8ms8gn1t?si=dHk8_1YQdP-iCEWA" target="_blank" class="social-fixed-btn youtube-btn" aria-label="YouTube">
                    <i class="fab fa-youtube"></i>
                    <span class="social-tooltip">YouTube</span>
                </a>
                <a href="https://www.tiktok.com/@corgidog114666?_t=ZS-8xwHtofNTBI&_r=1" target="_blank" class="social-fixed-btn tiktok-btn" aria-label="TikTok">
                    <i class="fab fa-tiktok"></i>
                    <span class="social-tooltip">TikTok</span>
                </a>
                <a href="https://www.instagram.com/corgidog666/" target="_blank" class="social-fixed-btn instagram-btn" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                    <span class="social-tooltip">Instagram</span>
                </a>
            </div>
        `;

        // 在body末尾插入社群按鈕
        document.body.insertAdjacentHTML('beforeend', socialFloatHTML);
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 等待DOM完全加載後設置事件
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMobileMenu();
            this.setupAdminLogin();
            this.setupDropdownMenus();
        });

        // 如果DOM已經加載完成，直接設置
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMobileMenu();
                this.setupAdminLogin();
                this.setupDropdownMenus();
            });
        } else {
            this.setupMobileMenu();
            this.setupAdminLogin();
            this.setupDropdownMenus();
        }
    }

    // 設置移動端選單
    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    // 設置管理員登入
    setupAdminLogin() {
        const adminLogo = document.getElementById('adminLogo');
        if (adminLogo) {
            let clickCount = 0;
            let clickTimer = null;

            adminLogo.addEventListener('click', (e) => {
                clickCount++;
                
                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 2000);
                } else if (clickCount === 5) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    window.location.href = 'admin/login.html';
                }
            });
        }
    }

    // 設置下拉選單
    setupDropdownMenus() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = toggle.parentElement;
                dropdown.classList.toggle('active');
            });
        });

        // 點擊外部關閉下拉選單
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                const activeDropdowns = document.querySelectorAll('.nav-dropdown.active');
                activeDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    // 更新導航選單品種（供其他腳本調用）
    updateBreedMenus(pets) {
        if (typeof generateBreedMenus === 'function') {
            generateBreedMenus(pets);
        }
    }
}

// 初始化導航管理器
const navigationManager = new NavigationManager();

// 將導航管理器暴露給全局，供其他腳本使用
window.NavigationManager = NavigationManager;
window.navigationManager = navigationManager;