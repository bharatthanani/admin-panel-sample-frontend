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
    return api.get(`user/get-users?page=${page}`);
  },

  deleteUser(userId) {
    return api.get(`user/delete-user/${userId}`);
  },

  addUser(formData) {
    return api.post("user/add-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateUser(userId, formData) {
    return api.post(`user/update-user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // ================= ADMIN =================

  getVendors() {
    return api.get("user/get-vendors");
  },

  getColorForAdmin() {
    return api.get("product/get-colors-backend");
  },

  getCategoryForAdmin() {
    return api.get("product/get-categories-backend");
  },

  addUpdateCategory(data) {
    return api.post("product/add-update-category-backend", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteProduct(id) {
    return api.get(`product/delete-product-backend/${id}`);
  },

  deleteCategory(id) {
    return api.get(`product/delete-category-backend/${id}`);
  },

  addProductForAdmin(data) {
    return api.post("product/add-product-backend", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getProductForAdmin() {
    return api.get("product/get-product-backend");
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
  deleteStore(id) {
    return api.get(`store/delete-store/${id}`);
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