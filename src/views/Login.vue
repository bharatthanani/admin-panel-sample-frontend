<template>
  <div class="auth-shell">

    <!-- ── Left Panel ── -->
    <div class="auth-left">
      <div class="auth-left-inner">
        <div class="auth-brand">
          <div class="auth-brand-icon"><i class="bi bi-lightning-charge-fill"></i></div>
          <span class="auth-brand-name">AdminPanel</span>
        </div>

        <div class="auth-left-copy">
          <h2>Everything you need,<br/>in one dashboard.</h2>
          <p>Manage products, stores, vendors and users from a single powerful interface.</p>
        </div>

        <!-- Quick login role cards -->
        <div class="auth-quick-label">Quick login — click to fill</div>
        <div class="auth-quick-roles">
          <button
            v-for="demo in demoAccounts"
            :key="demo.role"
            type="button"
            class="auth-quick-card"
            :class="{ 'auth-quick-active': form.email === demo.email }"
            @click="fillDemo(demo)"
          >
            <div class="auth-quick-icon" :style="{ background: demo.bg }">
              <i :class="demo.icon" :style="{ color: demo.color }"></i>
            </div>
            <div class="auth-quick-info">
              <span class="auth-quick-role">{{ demo.label }}</span>
              <span class="auth-quick-email">{{ demo.email }}</span>
            </div>
            <svg v-if="form.email === demo.email" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>

        <div class="auth-left-stats">
          <div class="auth-stat">
            <span class="auth-stat-num">10k+</span>
            <span class="auth-stat-label">Products</span>
          </div>
          <div class="auth-stat">
            <span class="auth-stat-num">500+</span>
            <span class="auth-stat-label">Vendors</span>
          </div>
          <div class="auth-stat">
            <span class="auth-stat-num">99.9%</span>
            <span class="auth-stat-label">Uptime</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right Panel ── -->
    <div class="auth-right">
      <div class="auth-form-wrap">

        <div class="auth-form-head">
          <h1 class="auth-form-title">Welcome back</h1>
          <p class="auth-form-sub">Sign in to your account to continue</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">

          <!-- Email -->
          <div class="auth-field">
            <label class="auth-label">Email Address</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                class="auth-input"
                type="email"
                v-model="form.email"
                placeholder="you@example.com"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="auth-field">
            <div class="auth-label-row">
              <label class="auth-label">Password</label>
              <a href="#" class="auth-forgot">Forgot password?</a>
            </div>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                class="auth-input"
                :type="showPass ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button type="button" class="auth-eye" @click="showPass = !showPass" tabindex="-1">
                <svg v-if="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <!-- Active role indicator -->
          <div class="auth-role-indicator" v-if="activeDemo">
            <div class="auth-role-dot" :style="{ background: activeDemo.color }"></div>
            Signing in as <strong>{{ activeDemo.label }}</strong>
          </div>

          <!-- Submit -->
          <button type="submit" class="auth-submit" :disabled="isLoading">
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="auth-spinner"></span>
          </button>

          <!-- Divider -->
          <div class="auth-divider"><span>or</span></div>

          <!-- Social -->
          <div class="auth-social">
            <button type="button" class="auth-social-btn">
              <i class="bi bi-google"></i> Google
            </button>
            <button type="button" class="auth-social-btn">
              <i class="bi bi-facebook"></i> Facebook
            </button>
          </div>

          <p class="auth-switch">
            Don't have an account?
            <router-link to="/register">Create one</router-link>
          </p>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { env } from '../../config.js';

const router  = useRouter();
const toast   = useToast();
const auth    = useAuthStore();

const isLoading = ref(false);
const showPass  = ref(false);
const baseURL   = env.BASE_URL;

const form = reactive({ email: '', password: '' });

// ── Demo accounts — update emails to match your seeder ──
const demoAccounts = [
  {
    role:     'admin',
    label:    'Admin',
    email:    'superadmin@admin.com',
    password: '12345',
    icon:     'bi bi-shield-fill-check',
    bg:       '#eef0fd',
    color:    '#6366f1',
  },
  {
    role:     'vendor',
    label:    'Vendor',
    email:    'vendor@demo.com',
    password: '12345',
    icon:     'bi bi-person-badge-fill',
    bg:       '#fffbeb',
    color:    '#f59e0b',
  },
  {
    role:     'user',
    label:    'User',
    email:    'user@demo.com',
    password: '12345',
    icon:     'bi bi-person-fill',
    bg:       '#ecfdf5',
    color:    '#10b981',
  },
];

const activeDemo = computed(() =>
  demoAccounts.find(d => d.email === form.email) || null
);

const fillDemo = (demo) => {
  form.email    = demo.email;
  form.password = demo.password;
};

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const response = await axios.post(`${baseURL}/login`, form);
    const data = response.data;

    auth.token       = data.token;
    auth.user        = data.user;
    auth.role        = data.user.role;
    auth.permissions = data.user.permissions;

    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('user',        JSON.stringify(data.user));
    localStorage.setItem('role',        data.user.role);
    localStorage.setItem('permissions', JSON.stringify(data.user.permissions));

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    toast.success(data.message || 'Login successful!');
    router.push('/admin/dashboard');

    form.email    = '';
    form.password = '';
  } catch (error) {
    toast.error(error.response?.data?.message || 'Invalid credentials!');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (auth.isLoggedIn) router.push('/admin/dashboard');
});
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth-shell {
  display: flex; min-height: 100vh;
  font-family: -apple-system, 'Helvetica Neue', sans-serif;
}

/* ── Left ── */
.auth-left {
  width: 46%; background: #111;
  display: flex; align-items: center; justify-content: center;
  padding: 3rem; position: relative; overflow: hidden;
}
.auth-left::before {
  content: ''; position: absolute;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%);
  top: -100px; left: -100px; pointer-events: none;
}
.auth-left::after {
  content: ''; position: absolute;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16,185,129,.15) 0%, transparent 70%);
  bottom: -80px; right: -80px; pointer-events: none;
}
.auth-left-inner {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 2rem;
  max-width: 380px; width: 100%;
}
.auth-brand { display: flex; align-items: center; gap: 10px; }
.auth-brand-icon {
  width: 36px; height: 36px; background: #6366f1; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 17px;
}
.auth-brand-name { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.3px; }

.auth-left-copy h2 { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.35; letter-spacing: -.5px; margin-bottom: 10px; }
.auth-left-copy p  { font-size: 13.5px; color: rgba(255,255,255,.45); line-height: 1.65; }

/* Quick role cards */
.auth-quick-label { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.3); }
.auth-quick-roles { display: flex; flex-direction: column; gap: 8px; }
.auth-quick-card {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; padding: 10px 12px; cursor: pointer;
  transition: all .15s; text-align: left; width: 100%;
}
.auth-quick-card:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.2); }
.auth-quick-active { background: rgba(99,102,241,.2) !important; border-color: rgba(99,102,241,.5) !important; }
.auth-quick-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.auth-quick-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.auth-quick-role  { font-size: 12px; font-weight: 700; color: #fff; }
.auth-quick-email { font-size: 11px; color: rgba(255,255,255,.4); }

.auth-left-stats { display: flex; gap: 2rem; padding-top: .5rem; border-top: 1px solid rgba(255,255,255,.08); }
.auth-stat { display: flex; flex-direction: column; gap: 3px; }
.auth-stat-num   { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -.5px; }
.auth-stat-label { font-size: 11px; color: rgba(255,255,255,.35); font-weight: 500; text-transform: uppercase; letter-spacing: .06em; }

/* ── Right ── */
.auth-right {
  flex: 1; background: #fafaf8;
  display: flex; align-items: center; justify-content: center;
  padding: 3rem 2rem;
}
.auth-form-wrap { width: 100%; max-width: 400px; }
.auth-form-head { margin-bottom: 2rem; }
.auth-form-title { font-size: 24px; font-weight: 700; color: #111; letter-spacing: -.4px; margin-bottom: 6px; }
.auth-form-sub   { font-size: 14px; color: #aaa; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.auth-field { display: flex; flex-direction: column; gap: 6px; }
.auth-label { font-size: 12.5px; font-weight: 600; color: #555; }
.auth-label-row { display: flex; align-items: center; justify-content: space-between; }
.auth-forgot { font-size: 12px; color: #6366f1; text-decoration: none; font-weight: 500; }
.auth-forgot:hover { text-decoration: underline; }

.auth-input-wrap { position: relative; }
.auth-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #c0c0bb; pointer-events: none; }
.auth-input {
  width: 100%; padding: 11px 38px;
  font-size: 13.5px; background: #fff;
  border: 1px solid #e0e0dc; border-radius: 10px;
  color: #111; font-family: inherit;
  transition: border-color .12s, box-shadow .12s; outline: none;
}
.auth-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.auth-input::placeholder { color: #c0c0bb; }
.auth-eye {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #bbb;
  display: flex; align-items: center; padding: 2px; transition: color .12s;
}
.auth-eye:hover { color: #666; }

/* Role indicator */
.auth-role-indicator {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; color: #666; font-weight: 500;
  background: #f5f5f3; border: 1px solid #e8e8e5;
  border-radius: 8px; padding: 8px 12px;
}
.auth-role-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.auth-role-indicator strong { color: #111; }

.auth-submit {
  width: 100%; padding: 12px; background: #111; color: #fff;
  border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .14s;
  display: flex; align-items: center; justify-content: center; min-height: 46px;
}
.auth-submit:hover:not(:disabled) { background: #2d2d2d; }
.auth-submit:disabled { opacity: .7; cursor: not-allowed; }

.auth-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-divider {
  display: flex; align-items: center; gap: 12px;
  color: #ccc; font-size: 12px;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: #e8e8e5;
}

.auth-social { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.auth-social-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 10px; border: 1px solid #e0e0dc; border-radius: 10px;
  background: #fff; font-size: 13px; font-weight: 600; color: #444;
  cursor: pointer; font-family: inherit; transition: all .12s;
}
.auth-social-btn:hover { background: #f5f5f3; border-color: #ccc; }

.auth-switch { font-size: 13px; color: #aaa; text-align: center; }
.auth-switch a { color: #6366f1; font-weight: 600; text-decoration: none; }
.auth-switch a:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .auth-left { display: none; }
  .auth-right { padding: 2rem 1.25rem; background: #fff; }
}
</style>