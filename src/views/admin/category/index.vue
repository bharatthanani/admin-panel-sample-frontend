<script setup>
import { ref, computed, onMounted } from 'vue';
import { ClientService } from '@/services/index.js';
import { useToast } from 'vue-toastification';
import { env } from '../../../../config.js';
import PremiumLoader from '@/components/PremiumLoader.vue';

const toast = useToast();

/* ── State ── */
const categories      = ref([]);
const isLoading       = ref(false);
const loadingText     = ref('Loading');
const searchQuery     = ref('');
const showModal       = ref(false);
const showDeleteModal = ref(false);
const isEdit          = ref(false);
const imagePreview    = ref(null);
const categoryToDelete = ref(null);
const baseImageURL    = env.IMAGE_URL;

const categoryForm = ref({ id: null, category_name: '', category_image: null });

/* ── Computed ── */
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter(c => c.category_name.toLowerCase().includes(q));
});

/* ── Helpers ── */
const resetForm = () => {
  categoryForm.value = { id: null, category_name: '', category_image: null };
  imagePreview.value = null;
  const el = document.getElementById('categoryImage');
  if (el) el.value = '';
};
const clearImage = () => {
  imagePreview.value = null; categoryForm.value.category_image = null;
  const el = document.getElementById('categoryImage'); if (el) el.value = '';
};
const openAddModal     = () => { isEdit.value = false; resetForm(); showModal.value = true; };
const closeModal       = () => { showModal.value = false; resetForm(); };
const openDeleteModal  = (cat) => { categoryToDelete.value = cat; showDeleteModal.value = true; };
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) { categoryForm.value.category_image = file; imagePreview.value = URL.createObjectURL(file); }
};
const editCategory = (cat) => {
  isEdit.value = true;
  categoryForm.value.id = cat.id;
  categoryForm.value.category_name = cat.category_name;
  categoryForm.value.category_image = null;
  imagePreview.value = cat.category_image ? `${baseImageURL}/category/${cat.category_image}` : null;
  showModal.value = true;
};

/* ── API ── */
const getCategories = async () => {
  try {
    loadingText.value = 'Loading categories'; isLoading.value = true;
    categories.value = (await ClientService.getCategoryForAdmin()).data.category;
  } catch { toast.error('Failed to load categories.'); }
  finally { isLoading.value = false; }
};
const handleSubmit = async () => {
  try {
    loadingText.value = isEdit.value ? 'Updating category' : 'Saving category';
    isLoading.value = true;
    const fd = new FormData();
    fd.append('category_name', categoryForm.value.category_name);
    if (categoryForm.value.category_image) fd.append('category_image', categoryForm.value.category_image);
    if (isEdit.value && categoryForm.value.id) fd.append('id', categoryForm.value.id);
    const res = await ClientService.addUpdateCategory(fd);
    if (res.data.status) { toast.success(res.data.message); await getCategories(); closeModal(); }
    else toast.error(res.data.message || 'Something went wrong!');
  } catch (e) {
    if (e.response?.status === 422) {
      const errs = e.response.data.errors;
      for (const k in errs) { if (errs[k]?.[0]) { toast.error(errs[k][0]); break; } }
    } else toast.error(e.response?.data?.message || 'Something went wrong!');
  } finally { isLoading.value = false; }
};
const confirmDelete = async () => {
  if (!categoryToDelete.value) return;
  try {
    loadingText.value = 'Deleting category'; isLoading.value = true;
    const res = await ClientService.deleteCategory(categoryToDelete.value.id);
    if (res.data.status) { 
      toast.success(res.data.message); 
      await getCategories(); 
      showDeleteModal.value = false; 
      categoryToDelete.value = null; 
    }
    else toast.error(res.data.message);
  } catch { toast.error('Something went wrong.'); }
  finally { isLoading.value = false; }
};

onMounted(() => { 
  document.title = 'Dashboard - Categories'; 
  isLoading.value = true; loadingText.value = 'Loading Categories...';
  getCategories(); 
  });
</script>


<template>
  <div class="cm-page">

    <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ───── Page Header ───── -->
    <div class="cm-header">
      <div class="cm-header-left">
        <span class="cm-eyebrow">Catalog</span>
        <h1 class="cm-title">Category Management</h1>
      </div>
      <div class="cm-header-stats">
        <div class="cm-stat">
          <span class="cm-stat-num">{{ categories.length }}</span>
          <span class="cm-stat-label">Total Categories</span>
        </div>
      </div>
      <button class="cm-add-btn" @click="openAddModal" v-permission="['categories.create']">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Category
      </button>
    </div>

    <!-- ───── Search Bar ───── -->
    <div class="cm-search-wrap">
      <div class="cm-search-inner">
        <svg class="cm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="cm-search-input" type="text" v-model="searchQuery" placeholder="Search categories…" />
        <button v-if="searchQuery" class="cm-search-clear" @click="searchQuery = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <span class="cm-result-count">{{ filteredCategories.length }} result{{ filteredCategories.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- ───── Table Card ───── -->
    <div class="cm-card">
      <div class="cm-table-wrap">
        <table class="cm-table">
          <thead>
            <tr>
              <th style="width:70px">ID</th>
              <th style="width:75px">Image</th>
              <th>Category Name</th>
              <th style="width:170px; text-align:right" v-permission="['categories.update', 'categories.delete']">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="4" class="cm-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="margin-bottom:8px;opacity:.35"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                <span>No categories found</span>
              </td>
            </tr>
            <tr v-for="category in filteredCategories" :key="category.id" class="cm-row">
              <td>
                <span class="cm-id-badge">{{ category.id }}</span>
              </td>
              <td>
                <div class="cm-img-wrap">
                  <img
                    v-if="category.category_image"
                    :src="`${baseImageURL}/category/${category.category_image}`"
                    :alt="category.category_name"
                    @error="e => e.target.style.display='none'"
                  />
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              </td>
              <td class="cm-cat-name">{{ category.category_name }}</td>
              <td v-permission="['categories.update', 'categories.delete']">
                <div class="cm-actions">
                  <button class="cm-btn-edit" @click="editCategory(category)" title="Edit">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="cm-btn-del" @click="openDeleteModal(category)" title="Delete">
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
      <div class="cm-overlay" :class="{ open: showModal }" @click.self="closeModal">
        <div class="cm-modal">

          <div class="cm-modal-header">
            <div>
              <p class="cm-modal-title">{{ isEdit ? 'Edit Category' : 'Add Category' }}</p>
              <p class="cm-modal-sub">{{ isEdit ? 'Update the category details below' : 'Fill in the details to create a new category' }}</p>
            </div>
            <button class="cm-modal-close" @click="closeModal" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="cm-modal-body">
            <form @submit.prevent="handleSubmit" id="categoryForm">

              <p class="cm-section-label">Category Info</p>

              <div class="cm-field">
                <label class="cm-label">Category Name</label>
                <input
                  class="cm-input"
                  type="text"
                  v-model="categoryForm.category_name"
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div class="cm-divider"></div>
              <p class="cm-section-label">Category Image</p>

              <div class="cm-field">
                <label class="cm-upload-zone" for="categoryImage">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>{{ imagePreview ? 'Change image' : 'Click to upload' }}</span>
                  <input type="file" id="categoryImage" class="cm-file-input" @change="handleImageUpload" accept="image/*" />
                </label>
                <div v-if="imagePreview" class="cm-preview-single">
                  <img :src="imagePreview" alt="Preview" />
                  <button type="button" class="cm-preview-remove" @click="clearImage">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

            </form>
          </div>

          <div class="cm-modal-footer">
            <button type="button" class="cm-btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" form="categoryForm" class="cm-btn-save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ isEdit ? 'Update Category' : 'Save Category' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- ───── Delete Modal ───── -->
    <Teleport to="body">
      <div class="cm-overlay" :class="{ open: showDeleteModal }" @click.self="showDeleteModal = false">
        <div class="cm-modal cm-modal-sm">

          <div class="cm-modal-header">
            <p class="cm-modal-title">Confirm deletion</p>
            <button class="cm-modal-close" @click="showDeleteModal = false" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="cm-del-body">
            <div class="cm-del-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <p class="cm-del-title">Delete this category?</p>
            <p class="cm-del-sub">
              <strong>{{ categoryToDelete?.category_name }}</strong> will be permanently removed. This cannot be undone.
            </p>
          </div>

          <div class="cm-modal-footer">
            <button type="button" class="cm-btn-cancel" @click="showDeleteModal = false">Keep it</button>
            <button type="button" class="cm-btn-danger" @click="confirmDelete">
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
*, *::before, *::after { box-sizing: border-box; }

</style>