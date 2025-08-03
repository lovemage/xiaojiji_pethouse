// 品種篩選功能組件
class BreedFilter {
    constructor(category) {
        this.category = category; // 'small', 'medium', 'large'
        this.currentBreed = 'all';
        this.pets = [];
        this.breeds = new Map(); // 品種計數
        this.container = document.getElementById('breedFilters');
        this.gridContainer = document.querySelector('.dogs-grid');
        this.noPetsMessage = document.getElementById('noPetsMessage');
        
        this.init();
    }

    async init() {
        try {
            await this.loadPets();
            this.generateBreedFilters();
            this.bindEvents();
            this.displayPets();
        } catch (error) {
            console.error('品種篩選初始化失敗:', error);
        }
    }

    // 載入該分類的所有寵物
    async loadPets() {
        try {
            this.pets = await API.getPets({ category: this.category });
            this.calculateBreedCounts();
        } catch (error) {
            console.error('載入寵物資料失敗:', error);
            this.pets = [];
        }
    }

    // 計算品種數量
    calculateBreedCounts() {
        this.breeds.clear();
        this.breeds.set('all', this.pets.length);
        
        this.pets.forEach(pet => {
            const breed = pet.breed || '未分類';
            this.breeds.set(breed, (this.breeds.get(breed) || 0) + 1);
        });
    }

    // 生成品種篩選按鈕
    generateBreedFilters() {
        if (!this.container) return;

        this.container.innerHTML = '';

        // 全部品種按鈕
        const allButton = this.createBreedButton('all', '全部品種', this.breeds.get('all') || 0);
        this.container.appendChild(allButton);

        // 各品種按鈕（排除數量為0的品種）
        [...this.breeds.entries()]
            .filter(([breed, count]) => breed !== 'all' && count > 0)
            .sort(([a], [b]) => a.localeCompare(b)) // 按品種名稱排序
            .forEach(([breed, count]) => {
                const button = this.createBreedButton(breed, breed, count);
                this.container.appendChild(button);
            });
    }

    // 創建品種按鈕
    createBreedButton(breed, label, count) {
        const button = document.createElement('button');
        button.className = `breed-btn ${breed === this.currentBreed ? 'active' : ''}`;
        button.dataset.breed = breed;
        button.innerHTML = `
            ${label}
            <span class="count">${count}</span>
        `;
        return button;
    }

    // 綁定事件
    bindEvents() {
        if (!this.container) return;

        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.breed-btn');
            if (!button) return;

            const breed = button.dataset.breed;
            this.selectBreed(breed);
        });
    }

    // 選擇品種
    async selectBreed(breed) {
        if (breed === this.currentBreed) return;

        this.currentBreed = breed;
        this.updateActiveButton();
        
        // 添加載入動畫
        this.container.classList.add('loading');
        
        try {
            if (breed === 'all') {
                // 顯示所有寵物
                this.displayPets();
            } else {
                // 載入特定品種的寵物
                await this.loadBreedPets(breed);
            }
        } finally {
            this.container.classList.remove('loading');
        }
    }

    // 載入特定品種寵物
    async loadBreedPets(breed) {
        try {
            const breedPets = await API.getPets({ 
                category: this.category, 
                breed: breed 
            });
            this.displayPets(breedPets);
        } catch (error) {
            console.error('載入品種寵物失敗:', error);
            this.showErrorMessage();
        }
    }

    // 更新激活按鈕狀態
    updateActiveButton() {
        this.container.querySelectorAll('.breed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = this.container.querySelector(`[data-breed="${this.currentBreed}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // 顯示寵物
    displayPets(pets = null) {
        const petsToShow = pets || this.pets.filter(pet => 
            this.currentBreed === 'all' || pet.breed === this.currentBreed
        );

        if (!this.gridContainer) return;

        this.gridContainer.innerHTML = '';

        if (petsToShow.length === 0) {
            this.showNoPetsMessage();
            return;
        }

        this.hideNoPetsMessage();

        petsToShow.forEach(pet => {
            const dogCard = this.createPetCard(pet);
            this.gridContainer.appendChild(dogCard);
        });

        // 重新初始化寵物卡片點擊事件
        this.initializePetCardEvents();
    }

    // 創建寵物卡片
    createPetCard(pet) {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        dogCard.dataset.petId = pet.id;
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

        // 載入顯示設定並生成卡片內容
        dogCard.innerHTML = this.generatePetCardHTML(pet, imageUrl);

        return dogCard;
    }

    // 生成寵物卡片HTML
    generatePetCardHTML(pet, imageUrl) {
        // 這裡使用全局的 generatePetCardHTML 函數或內聯實現
        if (typeof generatePetCardHTML === 'function') {
            return generatePetCardHTML(pet, imageUrl, window.displaySettings || {});
        }

        // 簡化版卡片HTML
        return `
            <div class="dog-image">
                <img src="${imageUrl}" alt="${pet.name}" loading="lazy">
                <div class="dog-overlay">
                    <button class="btn-primary view-photos">查看照片</button>
                </div>
            </div>
            <div class="dog-info">
                <h3>${pet.name}</h3>
                <p><strong>品種:</strong> ${pet.breed}</p>
                <p><strong>年齡:</strong> ${pet.age}</p>
                <p><strong>性別:</strong> ${pet.gender}</p>
                ${pet.price ? `<p class="price">NT$ ${pet.price}</p>` : ''}
            </div>
        `;
    }

    // 初始化寵物卡片事件
    initializePetCardEvents() {
        this.gridContainer.querySelectorAll('.dog-card').forEach(card => {
            const viewButton = card.querySelector('.view-photos');
            if (viewButton) {
                viewButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const petId = card.dataset.petId;
                    this.showPetPhotos(petId);
                });
            }

            // 卡片點擊事件
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.view-photos')) {
                    const petId = card.dataset.petId;
                    this.showPetPhotos(petId);
                }
            });
        });
    }

    // 顯示寵物照片
    showPetPhotos(petId) {
        const pet = this.pets.find(p => p.id == petId);
        if (!pet) return;

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

        if (images.length === 0) {
            alert('此寵物暫無照片');
            return;
        }

        // 使用現有的照片檢視器或創建簡單的彈窗
        this.openPhotoViewer(pet, images);
    }

    // 打開照片檢視器
    openPhotoViewer(pet, images) {
        // 如果有全局的照片檢視器函數就使用
        if (typeof openModal === 'function') {
            openModal(pet, images);
            return;
        }

        // 簡單的照片檢視實現
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
        `;

        content.innerHTML = `
            <div style="text-align: center;">
                <h3>${pet.name} - ${pet.breed}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                    ${images.map(img => `<img src="${img}" style="width: 100%; border-radius: 8px;" alt="${pet.name}">`).join('')}
                </div>
                <button onclick="this.closest('.photo-modal').remove()" style="background: #4682B4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">關閉</button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 顯示無寵物訊息
    showNoPetsMessage() {
        if (this.noPetsMessage) {
            this.noPetsMessage.style.display = 'block';
        }
    }

    // 隱藏無寵物訊息
    hideNoPetsMessage() {
        if (this.noPetsMessage) {
            this.noPetsMessage.style.display = 'none';
        }
    }

    // 顯示錯誤訊息
    showErrorMessage() {
        this.gridContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>載入失敗</h3>
                <p>無法載入寵物資料，請稍後再試</p>
                <button onclick="location.reload()" class="btn-primary">重新載入</button>
            </div>
        `;
    }

    // 刷新資料
    async refresh() {
        this.container.classList.add('loading');
        try {
            await this.loadPets();
            this.generateBreedFilters();
            this.displayPets();
        } finally {
            this.container.classList.remove('loading');
        }
    }
}

// 全局函數：初始化品種篩選器
function initializeBreedFilter(category) {
    return new BreedFilter(category);
}

// 導出給其他腳本使用
window.BreedFilter = BreedFilter;
window.initializeBreedFilter = initializeBreedFilter;