<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ClientService } from '@/services';
import PremiumLoader from '@/components/PremiumLoader.vue';
import { useToast } from 'vue-toastification';
import { env } from '../../../../config.js';


const toast = useToast();
const route = useRoute();

/* ── State ── */
const form = ref({
  product_name: '', product_price: '', product_qty: '',
  category_id: '', product_desc: '', color_id: [],
  product_image: '', image_name: [], id: null, store_id: '',
});

const products            = ref([]);
const isLoading           = ref(false);
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

/* ── API ── */
const getProduct = async () => {
    isLoading.value = true;
  try { 
      const storeId = route.params.storeId
       products.value = (await ClientService.getStoreProducts(storeId)).data.products; 
    }
  catch (e) { 
    toast.error(e.response?.data?.message); 
  }finally { isLoading.value = false; }
};

onMounted(() => {
  document.title = 'Dashboard - Product';
  isLoading.value = true; loadingText.value = 'Loading Products...';
  getProduct();
});
</script>

<template>
  <div class="pm-page">

    <PremiumLoader :active="isLoading" :text="loadingText" />

    <!-- ───── Page Header ───── -->
    <div class="pm-header">
      <div class="pm-header-left">
        <h1 class="pm-title">Stores Products</h1>
      </div>
      
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
              <th>Images</th>
              <th style="width:110px">Price</th>
              <th style="width:90px">Qty</th>
              <th style="width:80px">Image</th>
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
           <td>
            <div class="pm-avatar-group">
                <img
                v-for="img in product.product_images"
                :key="img.id"
                :src="`${baseImageURL}/product/${img.image_name}`"
                :alt="product.product_name"
                class="pm-thumb"
                @error="e => e.target.style.display='none'"
                />
            </div>
          </td>
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
    
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; }
.pm-avatar-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  max-width: 160px;
}

.pm-thumb {
  width: 40px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.pm-thumb:hover {
  transform: scale(1.2);
  z-index: 2;
}
</style>