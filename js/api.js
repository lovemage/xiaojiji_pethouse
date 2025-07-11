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
                throw new Error(`HTTP error! status: ${response.status}`);
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
}

// 全域可用
window.API = API; 