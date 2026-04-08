const BASE_URL = "https://tinhthanhpho.com/api/v1";
const API_KEY = "hvn_9M9z8FcdMN6V3ydDQistV9RnMGFSHxOi";

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": API_KEY,
};

const addressService = {
    getProvinces: async () => {
        try {
            
            const res = await fetch(`${BASE_URL}/new-provinces?limit=100`, { headers });
                        
            const json = await res.json();
            if (!json.success) {
                return { success: false, data: [] };
            }
            
            const provinces = Array.isArray(json.data) ? json.data : (json.data?.provinces || []);
            return {
                success: true,
                data: provinces
            };
        } catch (error) {
            console.error("Error fetching provinces:", error);
            return { success: false, data: [] };
        }
    },

    // Lấy danh sách quận/huyện theo tỉnh
    getDistrictsByProvince: async (provinceCode) => {
        try {
            const url = `${BASE_URL}/new-provinces/${provinceCode}/districts?limit=100`;
            const res = await fetch(url, { headers });
            const json = await res.json();
            if (!json.success) return { success: false, data: [] };
            const districts = Array.isArray(json.data) ? json.data : (json.data?.districts || []);
            return { success: true, data: districts };
        } catch (error) {
            console.error("Error fetching districts:", error);
            return { success: false, data: [] };
        }
    },

    // Lấy danh sách phường/xã theo quận/huyện
    getCommunesByDistrict: async (districtCode) => {
        try {
            const url = `${BASE_URL}/new-districts/${districtCode}/wards?limit=100`;
            const res = await fetch(url, { headers });
            const json = await res.json();
            if (!json.success) return { success: false, data: [] };
            const wards = Array.isArray(json.data) ? json.data : (json.data?.wards || []);
            return { success: true, data: wards };
        } catch (error) {
            console.error("Error fetching wards by district:", error);
            return { success: false, data: [] };
        }
    },

    // Lấy danh sách phường/xã theo tỉnh (vẫn giữ lại cho các phần khác dùng)
    getCommunesByProvince: async (provinceCode) => {
        try {
            
            const url = `${BASE_URL}/new-provinces/${provinceCode}/wards?limit=5000`;
            
            const res = await fetch(url, { headers });
            
            
            const json = await res.json();
            
    
            if (!json.success) {
                return { success: false, data: [] };
            }
            
            const wards = Array.isArray(json.data) ? json.data : (json.data?.wards || []);
            
            return {
                success: true,
                data: wards
            };
        } catch (error) {
            console.error("Error fetching wards:", error);
            return { success: false, data: [] };
        }
    }
};

export default addressService;
