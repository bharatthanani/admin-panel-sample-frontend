import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

import AdminLayout    from '../views/admin/layouts/AdminLayout.vue';
import Login          from '../views/Login.vue'
import Register       from '../views/Register.vue'
import Dashboard      from '../views/admin/dashboard/index.vue'
import Users          from '../views/admin/users/index.vue'
import Product        from '@/views/admin/product/index.vue'
import Store          from '@/views/admin/store/index.vue';
import storeProducts  from '@/views/admin/store/storeProducts.vue';
import Category       from "@/views/admin/category/index.vue";
import Role           from '@/views/admin/roles/index.vue';
import Unauthorized   from '@/views/Unauthorized.vue';

const routes = [
  { path: '/login',        name: 'Login',        component: Login,        meta: { guest: true } },
  { path: '/register',     name: 'Register',     component: Register,     meta: { guest: true } },
  { path: '/unauthorized', name: 'Unauthorized', component: Unauthorized },

  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard,
        meta: { requiresAuth: true, title: 'Dashboard' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: Users,
        meta: { requiresAuth: true, title: 'Users', permission: 'users.list' },
      },
      {
        path: 'product-management',
        name: 'Products',
        component: Product,
        meta: { requiresAuth: true, title: 'Products', permission: 'products.list' },
      },
      {
        path: 'store-management',
        name: 'StoreManagement',
        component: Store,
        meta: { requiresAuth: true, title: 'Store Management', permission: 'stores.list' },
      },
      {
        path: 'store-management/:storeId/products',
        name: 'StoreProducts',
        component: storeProducts,
        meta: { requiresAuth: true, title: 'Store Products', permission: 'stores.list' },
      },
      {
        path: 'category-management',
        name: 'CategoryManagement',
        component: Category,
        meta: { requiresAuth: true, title: 'Category Management', permission: 'categories.list' },
      },
      {
        path: 'role-management',
        name: 'RoleManagement',
        component: Role,
        meta: { requiresAuth: true, title: 'Role Management', role: 'admin' },
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Global Navigation Guard ──────────────────────────────────
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // 1. Guest-only pages
  if (to.meta.guest) {
    return auth.isLoggedIn ? next('/admin/dashboard') : next();
  }

  // 2. Must be logged in
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login');
  }

  // 3. Role check
  if (to.meta.role && !auth.hasRole(to.meta.role)) {
    return next('/unauthorized');
  }

  // 4. Permission check — blocks direct URL access
  if (to.meta.permission && !auth.can(to.meta.permission)) {
    return next('/unauthorized');
  }

  next();
});

export default router;