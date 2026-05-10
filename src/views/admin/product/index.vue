<script setup>
import { ref, computed, onMounted } from 'vue';
import { ClientService } from '@/services';
import { useToast } from 'vue-toastification';
import { env } from '../../../../config.js';
import PremiumLoader from '@/components/PremiumLoader.vue';

const toast = useToast();

/* ── State ── */
const form = ref({
  product_name: '', product_price: '', product_qty: '',
  category_id: '', product_desc: '', color_id: [],
  product_image: '', image_name: [], id: null, store_id: '',
});
const colors              = ref([]);
const categories          = ref([]);
const products            = ref([]);
const stores              = ref([]);
const storeCategory       = ref([]);
const isLoading           = ref(false);
const isProductEdit       = ref(false);
const showAddModal        = ref(false);
const showDeleteModal     = ref(false);
const productToDelete     = ref(null);
const productImage        = ref(null);
const productMultipleImage = ref([]);
const baseImageURL        = env.IMAGE_URL;
const loadingText      = ref('Loading');

/* ── Computed ── */
const lowStockCount = computed(() =>
  products.value.filter(p => Number(p.product_qty) < 10).length
);

/* ── Helpers ── */
const qtyClass = (qty) => {
  const n = Number(qty);
  if (n < 10) return 'pm-qty-low';
  if (n < 30) return 'pm-qty-mid';
  return 'pm-qty-ok';
};

const resetForm = () => {
  form.value = {
    product_name: '', product_price: '', product_qty: '',
    category_id: '', product_desc: '', color_id: [],
    product_image: '', image_name: [], id: null, store_id: '',
  };
  productImage.value = null;
  productMultipleImage.value = [];
  storeCategory.value = [];
};

const openAddModal = () => { isProductEdit.value = false; resetForm(); showAddModal.value = true; };
const closeAddModal = () => { showAddModal.value = false; resetForm(); };
const openDeleteModal = (product) => { productToDelete.value = product; showDeleteModal.value = true; };

/* ── File handlers ── */
const handleSingleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) { form.value.product_image = file; productImage.value = URL.createObjectURL(file); }
};
const handleMultipleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  form.value.image_name = files;
  productMultipleImage.value = files.map(f => URL.createObjectURL(f));
};

/* ── API ── */
const getColor = async () => {
  try { colors.value = (await ClientService.getColorForAdmin()).data.colors; }
  catch (e) { console.error(e); }
};
const getStore = async () => {
  try {
    const res = await ClientService.getStoreBackend();
    if (res.data.success) stores.value = res.data.stores;
  } catch (e) { console.error(e); }
};
const getCategory = async () => {
  try {
    isLoading.value = true;
    categories.value = (await ClientService.getCategoryForAdmin()).data.category;
  } catch (e) { console.error(e); }
  finally { isLoading.value = false; }
};
const getProduct = async () => {
  try { products.value = (await ClientService.getProductForAdmin()).data.products; }
  catch (e) { toast.error(e.response?.data?.message); }
};
const getCategoryForStore = async () => {
  if (!form.value.store_id) { storeCategory.value = []; return; }
  try {
    const res = await ClientService.getStoreCategoryBackend(form.value.store_id);
    if (res.data.success) storeCategory.value = res.data.categories;
    else toast.error(res.data.message);
  } catch { toast.error('Something went wrong'); }
};

const AddProduct = async () => {
  try {
    isLoading.value = true;
    const payload = { ...form.value, color_id: form.value.color_id.map(c => c.id) };
    const res = await ClientService.addProductForAdmin(payload);
    toast.success(res.data.message || 'Product saved!');
    getProduct(); closeAddModal();
  } catch (e) {
    if (e.response?.status === 422) {
      const errs = e.response.data.errors;
      for (const k in errs) { if (errs[k]?.[0]) { toast.error(errs[k][0]); break; } }
    } else toast.error(e.response?.data?.message || 'Something went wrong!');
  } finally { isLoading.value = false; }
};

const editProduct = async (product) => {
  isProductEdit.value = true;
  form.value.product_name  = product.product_name;
  form.value.store_id      = product.store_id;
  form.value.product_desc  = product.product_desc;
  form.value.product_qty   = product.product_qty;
  form.value.product_price = product.product_price;
  form.value.category_id   = product.category_id;
  form.value.id            = product.id;
  form.value.color_id      = product.product_colors;
  productImage.value = `${baseImageURL}/product/${product.product_image}`;
  productMultipleImage.value = product.product_images.map(img => `${baseImageURL}/product/${img.image_name}`);
  await getCategoryForStore();
  showAddModal.value = true;
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;
  try {
    isLoading.value = true;
    await ClientService.deleteProductForAdmin(productToDelete.value.id);
    toast.success('Product deleted successfully!');
    showDeleteModal.value = false; productToDelete.value = null; getProduct();
  } catch (e) { toast.error(e.response?.data?.message || 'Something went wrong!'); }
  finally { isLoading.value = false; }
};

onMounted(() => {
  document.title = 'Dashboard - Product';
  isLoading.value = true; loadingText.value = 'Loading Products...';
  getColor(); getCategory(); getProduct(); getStore();
});
</script>

<template>
  <div class="pm-page">

     <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ───── Page Header ───── -->
    <div class="pm-header">
      <div class="pm-header-left">
        <span class="pm-eyebrow">Inventory</span>
        <h1 class="pm-title">Manage Products</h1>
      </div>
      <div class="pm-header-stats">
        <div class="pm-stat">
          <span class="pm-stat-num">{{ products.length }}</span>
          <span class="pm-stat-label">Products</span>
        </div>
        <div class="pm-stat-divider"></div>
        <div class="pm-stat">
          <span class="pm-stat-num">{{ stores.length }}</span>
          <span class="pm-stat-label">Stores</span>
        </div>
        <div class="pm-stat-divider"></div>
        <div class="pm-stat">
          <span class="pm-stat-num pm-stat-warn">{{ lowStockCount }}</span>
          <span class="pm-stat-label">Low stock</span>
        </div>
      </div>
      <button class="pm-add-btn" @click="openAddModal" v-permission="['products.create']">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </button>
    </div>

    <!-- ───── Table Card ───── -->
    <div class="pm-card">
      <div class="pm-table-wrap">
        <table class="pm-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th style="width:170px">Store</th>
              <th>Product Name</th>
              <th style="width:110px">Price</th>
              <th style="width:90px">Qty</th>
              <th style="width:80px">Image</th>
              <th style="width:170px; text-align:right" v-permission="['products.update', 'products.delete']">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="7" class="pm-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom:8px;opacity:.35"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <span>No products found</span>
              </td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="pm-row">
              <td>
                <span class="pm-id-badge">{{ product.id }}</span>
              </td>
              <td>
                <span class="pm-store-pill" v-if="product.stores">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  {{ product.stores.store_name }}
                </span>
              </td>
              <td class="pm-product-name">{{ product.product_name }}</td>
              <td class="pm-price">${{ Number(product.product_price).toFixed(2) }}</td>
              <td>
                <span class="pm-qty-badge" :class="qtyClass(product.product_qty)">
                  {{ product.product_qty }}
                </span>
              </td>
              <td>
                <div class="pm-avatar">
                  <img
                    v-if="product.product_image"
                    :src="`${baseImageURL}/product/${product.product_image}`"
                    :alt="product.product_name"
                    @error="e => e.target.style.display='none'"
                  />
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              </td>
              <td v-permission="['products.update', 'products.delete']">
                <div class="pm-actions">
                  <button class="pm-btn-edit" @click="editProduct(product)" title="Edit">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="pm-btn-del" @click="openDeleteModal(product)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ───── Add / Edit Modal ───── -->
    <Teleport to="body">
      <div class="pm-overlay" :class="{ open: showAddModal }" @click.self="closeAddModal">
        <div class="pm-modal pm-modal-lg">

          <div class="pm-modal-header">
            <div>
              <p class="pm-modal-title">{{ isProductEdit ? 'Edit Product' : 'Add Product' }}</p>
              <p class="pm-modal-sub">{{ isProductEdit ? 'Update the details below' : 'Fill in the details to list a new product' }}</p>
            </div>
            <button class="pm-modal-close" @click="closeAddModal" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="pm-modal-body">
            <form @submit.prevent="AddProduct" id="productForm">

              <p class="pm-section-label">Basic Info</p>

              <div class="pm-field">
                <label class="pm-label">Product Name</label>
                <input class="pm-input" type="text" v-model="form.product_name" placeholder="e.g. Classic Oxford Shirt" required />
              </div>

              <div class="pm-row2">
                <div class="pm-field">
                  <label class="pm-label">Store</label>
                  <select class="pm-select" v-model="form.store_id" @change="getCategoryForStore" required>
                    <option value="">— Select Store —</option>
                    <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.store_name }}</option>
                  </select>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Category</label>
                  <select class="pm-select" v-model="form.category_id" required>
                    <option value="">— Select Category —</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.category_name }}</option>
                  </select>
                </div>
              </div>

              <div class="pm-row2">
                <div class="pm-field">
                  <label class="pm-label">Price ($)</label>
                  <div class="pm-input-prefix-wrap">
                    <span class="pm-input-prefix">$</span>
                    <input class="pm-input pm-input-prefixed" type="number" min="0" step="0.01" v-model="form.product_price" placeholder="0.00" required />
                  </div>
                </div>
                <div class="pm-field">
                  <label class="pm-label">Quantity</label>
                  <input class="pm-input" type="number" min="0" v-model="form.product_qty" placeholder="0" required />
                </div>
              </div>
              <input type="hidden" v-model="form.id" />

              <div class="pm-divider"></div>
              <p class="pm-section-label">Colors</p>

              <div class="pm-field">
                <label class="pm-label">Product Colors</label>
                <Multiselect
                  v-model="form.color_id"
                  :options="colors"
                  :multiple="true"
                  label="color_name"
                  track-by="id"
                  placeholder="Select colors..."
                  class="pm-multiselect"
                />
              </div>

              <div class="pm-divider"></div>
              <p class="pm-section-label">Images</p>

              <div class="pm-row2">
                <div class="pm-field">
                  <label class="pm-label">Front Image</label>
                  <label class="pm-upload-zone" for="ProductFrontImage">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Click to upload</span>
                    <input type="file" id="ProductFrontImage" class="pm-file-input" @change="handleSingleFileUpload" accept="image/*" />
                  </label>
                  <div v-if="productImage" class="pm-preview-single">
                    <img :src="productImage" alt="Preview" />
                    <button type="button" class="pm-preview-remove" @click="productImage = null; form.product_image = ''">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                <div class="pm-field">
                  <label class="pm-label">Additional Images</label>
                  <label class="pm-upload-zone" for="ProductMultipleImages">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                    <span>Select multiple</span>
                    <input type="file" id="ProductMultipleImages" class="pm-file-input" @change="handleMultipleFileUpload" multiple accept="image/*" />
                  </label>
                  <div v-if="productMultipleImage.length" class="pm-preview-grid">
                    <img v-for="(img, index) in productMultipleImage" :key="index" :src="img" alt="Preview" />
                  </div>
                </div>
              </div>

              <div class="pm-divider"></div>

              <div class="pm-field">
                <label class="pm-label">Description</label>
                <textarea class="pm-textarea" v-model="form.product_desc" placeholder="Describe the product..." rows="3" required></textarea>
              </div>

            </form>
          </div>

          <div class="pm-modal-footer">
            <button type="button" class="pm-btn-cancel" @click="closeAddModal">Cancel</button>
            <button type="submit" form="productForm" class="pm-btn-save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ isProductEdit ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ───── Delete Modal ───── -->
    <Teleport to="body">
      <div class="pm-overlay" :class="{ open: showDeleteModal }" @click.self="showDeleteModal = false">
        <div class="pm-modal pm-modal-sm">
          <div class="pm-modal-header">
            <p class="pm-modal-title">Confirm deletion</p>
            <button class="pm-modal-close" @click="showDeleteModal = false" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="pm-del-body">
            <div class="pm-del-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <p class="pm-del-title">Delete this product?</p>
            <p class="pm-del-sub">
              <strong>{{ productToDelete?.product_name }}</strong> will be permanently removed from inventory. This cannot be undone.
            </p>
          </div>
          <div class="pm-modal-footer" v-permission="['products.delete']">
            <button type="button" class="pm-btn-cancel" @click="showDeleteModal = false">Keep it</button>
            <button type="button" class="pm-btn-danger" @click="confirmDelete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; }

</style>