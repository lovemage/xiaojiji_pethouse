// API 連接配置
const API_BASE_URL = window.location.origin + '/api';

// API 請求封裝
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 如果是 FormData，移除 Content-Type 讓瀏覽器自動設定
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                // 嘗試獲取錯誤訊息
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // 如果無法解析 JSON，使用預設錯誤訊息
                }
                
                // 特殊處理複製寵物的錯誤
                if (endpoint.includes('/copy') && response.status === 500) {
                    errorMessage = '複製功能暫時無法使用，請稍後再試或聯絡系統管理員。';
                }
                
                throw new Error(errorMessage);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 寵物相關 API
    static async getPets() {
        return await this.request('/pets');
    }

    static async createPet(petData) {
        return await this.request('/pets', {
            method: 'POST',
            body: petData // FormData
        });
    }

    static async updatePet(id, petData) {
        return await this.request(`/pets/${id}`, {
            method: 'PUT',
            body: petData // FormData
        });
    }

    static async copyPet(id) {
        return await this.request(`/pets/${id}/copy`, {
            method: 'POST',
            body: JSON.stringify({
                // 確保複製的寵物不包含任何註記
                clearNotes: true
            })
        });
    }

    static async deletePet(id) {
        return await this.request(`/pets/${id}`, {
            method: 'DELETE'
        });
    }

    // 客戶諮詢相關 API
    static async getInquiries() {
        return await this.request('/inquiries');
    }

    static async createInquiry(inquiryData) {
        return await this.request('/inquiries', {
            method: 'POST',
            body: JSON.stringify(inquiryData)
        });
    }

    static async updateInquiry(id, updateData) {
        return await this.request(`/inquiries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    static async markInquiryAsRead(id) {
        return await this.request(`/inquiries/${id}/read`, {
            method: 'PUT'
        });
    }

    static async deleteInquiry(id) {
        return await this.request(`/inquiries/${id}`, {
            method: 'DELETE'
        });
    }

    // 客戶評價相關 API
    static async getTestimonials() {
        return await this.request('/testimonials');
    }

    static async createTestimonial(testimonialData) {
        return await this.request('/testimonials', {
            method: 'POST',
            body: JSON.stringify(testimonialData)
        });
    }

    static async updateTestimonial(id, testimonialData) {
        return await this.request(`/testimonials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(testimonialData)
        });
    }

    static async deleteTestimonial(id) {
        return await this.request(`/testimonials/${id}`, {
            method: 'DELETE'
        });
    }

    // 網站設定相關 API
    static async getSettings() {
        return await this.request('/settings');
    }

    static async updateSetting(key, value) {
        return await this.request('/settings', {
            method: 'POST',
            body: JSON.stringify({ key, value })
        });
    }

    // 相簿相關 API
    static async getGalleryImages(category = null) {
        const endpoint = category ? `/gallery?category=${category}` : '/gallery';
        return await this.request(endpoint);
    }

    static async createGalleryImage(imageData) {
        return await this.request('/gallery', {
            method: 'POST',
            body: imageData // FormData
        });
    }

    static async updateGalleryImage(id, imageData) {
        return await this.request(`/gallery/${id}`, {
            method: 'PUT',
            body: imageData // FormData
        });
    }

    static async deleteGalleryImage(id) {
        return await this.request(`/gallery/${id}`, {
            method: 'DELETE'
        });
    }

    // 公告相關 API
    static async getAnnouncements(activeOnly = false) {
        const endpoint = activeOnly ? '/announcements?active=true' : '/announcements';
        return await this.request(endpoint);
    }

    static async createAnnouncement(announcementData) {
        return await this.request('/announcements', {
            method: 'POST',
            body: JSON.stringify(announcementData)
        });
    }

    static async updateAnnouncement(id, announcementData) {
        return await this.request(`/announcements/${id}`, {
            method: 'PUT',
            body: JSON.stringify(announcementData)
        });
    }

    static async deleteAnnouncement(id) {
        return await this.request(`/announcements/${id}`, {
            method: 'DELETE'
        });
    }

    // Hero 圖片上傳
    static async uploadHeroImage(formData) {
        return await this.request('/upload-hero-image', {
            method: 'POST',
            body: formData // FormData 包含圖片檔案
        });
    }
}

// 全域可用
window.API = API; 