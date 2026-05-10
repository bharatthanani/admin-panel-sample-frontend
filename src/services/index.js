import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Accept = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

// User Services
export const ClientService = {

  // ================= USERS =================

  getUsers(page = 1) {
    return api.get(`/get-users?page=${page}`);
  },

  deleteUser(userId) {
    return api.get(`/delete-user/${userId}`);
  },

  addUser(formData) {
    return api.post("/add-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateUser(userId, formData) {
    return api.post(`/update-user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },


  // ================= PRODUCTS =================

  getProduct() {
    return api.get("frontend/get-product");
  },

  getProductDetail(id) {
    return api.get(`frontend/get-product-detail/${id}`);
  },


  // ================= STORES =================

  getStores() {
    return api.get("frontend/get-stores");
  },

  getStoreDetail(id) {
    return api.get(`frontend/get-stores-details/${id}`);
  },

  // ================= CATEGORY =================

  getCategory() {
    return api.get("frontend/category/get-categories");
  },

  // ================= ADMIN =================

  getVendors() {
    return api.get("get-vendors");
  },

  getColorForAdmin() {
    return api.get("get-colors-backend");
  },

  getCategoryForAdmin() {
    return api.get("get-categories-backend");
  },

  addUpdateCategory(data) {
    return api.post("add-update-category-backend", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteCategory(id) {
    return api.get(`delete-category-backend/${id}`);
  },

  addProductForAdmin(data) {
    return api.post("add-product-backend", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getProductForAdmin() {
    return api.get("get-product-backend");
  },

  // ================= STORE ADMIN =================

  addStore(data) {
    return api.post("store/add-store", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateStore(id, data) {
    return api.post(`store/update-store/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getTags() {
    return api.get("store/get-store-tags");
  },

  getStoreBackend() {
    return api.get("store/get-stores-backend");
  },

  getStoreCategoryBackend(id) {
    return api.get(`store/get-store-category-backend/${id}`);
  },

   getStoreProducts(storeId) {
    return api.get(`store/stores/${storeId}/products`);
  },

  // ================= ROLES & PERMISSIONS =================

  getRoles() {
    return api.get("roles");
  },

  getRoleUsers() {
    return api.get("users");
  },

  getPermissions() {
    return api.get("permissions");
  },

  assignRoleToUser(userId, role) {
    // return api.post(`assign-role/${userId}`, { role });
    return api.post(`/users/${userId}/assign-role`, { role });
  },

  updateRolePermissions(roleId, permissions) {
    return api.put(`/roles/${roleId}`, {
      permissions
    });
},
};

export default api;