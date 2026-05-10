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
          <h2>Join thousands of<br/>businesses today.</h2>
          <p>Create your account and get full access to the admin panel in seconds.</p>
        </div>

        <!-- Feature list -->
        <div class="auth-features">
          <div class="auth-feature" v-for="f in features" :key="f.text">
            <div class="auth-feature-icon" :style="{ background: f.bg }">
              <i :class="f.icon" :style="{ color: f.color }"></i>
            </div>
            <div class="auth-feature-text">
              <span class="auth-feature-title">{{ f.title }}</span>
              <span class="auth-feature-sub">{{ f.text }}</span>
            </div>
          </div>
        </div>

        <div class="auth-left-stats">
          <div class="auth-stat">
            <span class="auth-stat-num">Free</span>
            <span class="auth-stat-label">To Start</span>
          </div>
          <div class="auth-stat">
            <span class="auth-stat-num">24/7</span>
            <span class="auth-stat-label">Support</span>
          </div>
          <div class="auth-stat">
            <span class="auth-stat-num">100%</span>
            <span class="auth-stat-label">Secure</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right Panel ── -->
    <div class="auth-right">
      <div class="auth-form-wrap">

        <div class="auth-form-head">
          <h1 class="auth-form-title">Create account</h1>
          <p class="auth-form-sub">Fill in your details to get started</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">

          <!-- Name Row -->
          <div class="auth-row2">
            <div class="auth-field">
              <label class="auth-label">First Name</label>
              <input
                class="auth-input" :class="{ 'auth-input-err': errors.first_name }"
                type="text" v-model="form.first_name"
                placeholder="John" required
              />
              <span v-if="errors.first_name" class="auth-err">{{ errors.first_name }}</span>
            </div>
            <div class="auth-field">
              <label class="auth-label">Last Name</label>
              <input
                class="auth-input" :class="{ 'auth-input-err': errors.last_name }"
                type="text" v-model="form.last_name"
                placeholder="Doe" required
              />
              <span v-if="errors.last_name" class="auth-err">{{ errors.last_name }}</span>
            </div>
          </div>

          <!-- Email -->
          <div class="auth-field">
            <label class="auth-label">Email Address</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                class="auth-input auth-input-iconed" :class="{ 'auth-input-err': errors.email }"
                type="email" v-model="form.email"
                placeholder="you@example.com" required autocomplete="email"
              />
            </div>
            <span v-if="errors.email" class="auth-err">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="auth-field">
            <label class="auth-label">Password</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                class="auth-input auth-input-iconed" :class="{ 'auth-input-err': errors.password }"
                :type="showPass ? 'text' : 'password'"
                v-model="form.password" placeholder="Min. 6 characters" required
              />
              <button type="button" class="auth-eye" @click="showPass = !showPass" tabindex="-1">
                <svg v-if="!showPass" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <!-- Password strength -->
            <div class="auth-strength">
              <div class="auth-strength-bars">
                <div v-for="i in 4" :key="i" class="auth-strength-bar" :class="strengthClass(i)"></div>
              </div>
              <span class="auth-strength-label" :class="'str-' + passwordStrength.level">{{ passwordStrength.label }}</span>
            </div>
            <span v-if="errors.password" class="auth-err">{{ errors.password }}</span>
          </div>

          <!-- Confirm Password -->
          <div class="auth-field">
            <label class="auth-label">Confirm Password</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                class="auth-input auth-input-iconed" :class="{ 'auth-input-err': errors.confirm_password }"
                :type="showConfirmPass ? 'text' : 'password'"
                v-model="form.confirm_password" placeholder="Re-enter password" required
              />
              <button type="button" class="auth-eye" @click="showConfirmPass = !showConfirmPass" tabindex="-1">
                <svg v-if="!showConfirmPass" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span v-if="errors.confirm_password" class="auth-err">{{ errors.confirm_password }}</span>
          </div>

          <!-- Terms -->
          <label class="auth-check-wrap">
            <input type="checkbox" v-model="agreed" required />
            <span class="auth-check-box">
              <svg v-if="agreed" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="auth-check-label">
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </span>
          </label>

          <!-- Submit -->
          <button type="submit" class="auth-submit" :disabled="isLoading || !agreed">
            <span v-if="!isLoading">Create Account</span>
            <span v-else class="auth-spinner"></span>
          </button>

          <p class="auth-switch">
            Already have an account?
            <router-link to="/login">Sign in</router-link>
          </p>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { env } from '../../config.js';

const router  = useRouter();
const toast   = useToast();
const baseURL = env.BASE_URL;

const isLoading      = ref(false);
const showPass       = ref(false);
const showConfirmPass = ref(false);
const agreed         = ref(false);

const form = reactive({
  first_name: '', last_name: '', email: '',
  password: '', confirm_password: '',
});

const errors = reactive({
  first_name: '', last_name: '', email: '',
  password: '', confirm_password: '',
});

const features = [
  { title: 'Product Management', text: 'Add, edit and track all products', icon: 'bi bi-box-seam-fill', bg: '#eef0fd', color: '#6366f1' },
  { title: 'Store Control',      text: 'Manage multiple stores easily',    icon: 'bi bi-shop',           bg: '#fffbeb', color: '#f59e0b' },
  { title: 'Role Permissions',   text: 'Admin, vendor and user roles',     icon: 'bi bi-shield-fill',    bg: '#ecfdf5', color: '#10b981' },
];

/* ── Password strength ── */
const passwordStrength = computed(() => {
  const p = form.password;
  if (!p) return { level: 0, label: '' };
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { level: score, label: labels[score] || 'Strong' };
});
const strengthClass = (i) => {
  const l = passwordStrength.value.level;
  if (l === 0) return '';
  if (i > l) return '';
  if (l === 1) return 'str-weak';
  if (l === 2) return 'str-fair';
  if (l === 3) return 'str-good';
  return 'str-strong';
};

/* ── Validate ── */
const validateForm = () => {
  Object.keys(errors).forEach(k => errors[k] = '');
  let ok = true;
  if (!form.first_name.trim())  { errors.first_name = 'First name is required'; ok = false; }
  if (!form.last_name.trim())   { errors.last_name  = 'Last name is required';  ok = false; }
  if (!form.email.trim())       { errors.email = 'Email is required'; ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Invalid email'; ok = false; }
  if (!form.password)           { errors.password = 'Password is required'; ok = false; }
  else if (form.password.length < 6) { errors.password = 'Min. 6 characters'; ok = false; }
  if (!form.confirm_password)   { errors.confirm_password = 'Please confirm password'; ok = false; }
  else if (form.password !== form.confirm_password) { errors.confirm_password = 'Passwords do not match'; ok = false; }
  return ok;
};

const resetForm = () => {
  Object.assign(form, { first_name:'', last_name:'', email:'', password:'', confirm_password:'' });
  Object.keys(errors).forEach(k => errors[k] = '');
  agreed.value = false;
};

/* ── Submit ── */
const handleSubmit = async () => {
  if (!validateForm()) { toast.error('Please fix the errors below'); return; }
  isLoading.value = true;
  try {
    const res = await axios.post(`${baseURL}/create-account`, { ...form });
    toast.success(res.data.message || 'Account created successfully!');
    resetForm();
    router.push('/login');
  } catch (error) {
    if (error.response?.status === 422) {
      const errs = error.response.data.errors;
      Object.keys(errs).forEach(k => { if (errors[k] !== undefined) errors[k] = errs[k][0]; });
      toast.error('Please fix the validation errors');
    } else {
      toast.error(error.response?.data?.message || 'Something went wrong!');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth-shell {
  display: flex; min-height: 100vh;
  font-family: -apple-system, 'Helvetica Neue', sans-serif;
}

/* ── Left ── */
.auth-left {
  width: 44%; background: #111;
  display: flex; align-items: center; justify-content: center;
  padding: 3rem; position: relative; overflow: hidden;
}
.auth-left::before {
  content: ''; position: absolute; width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,.25) 0%, transparent 70%);
  top: -100px; left: -100px; pointer-events: none;
}
.auth-left::after {
  content: ''; position: absolute; width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(245,158,11,.15) 0%, transparent 70%);
  bottom: -60px; right: -60px; pointer-events: none;
}
.auth-left-inner {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 2rem;
  max-width: 360px; width: 100%;
}
.auth-brand { display: flex; align-items: center; gap: 10px; }
.auth-brand-icon {
  width: 36px; height: 36px; background: #6366f1; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 17px;
}
.auth-brand-name { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.3px; }
.auth-left-copy h2 { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.35; letter-spacing: -.5px; margin-bottom: 10px; }
.auth-left-copy p  { font-size: 13.5px; color: rgba(255,255,255,.45); line-height: 1.65; }

/* Features */
.auth-features { display: flex; flex-direction: column; gap: 12px; }
.auth-feature  { display: flex; align-items: center; gap: 12px; }
.auth-feature-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0;
}
.auth-feature-title { display: block; font-size: 13px; font-weight: 600; color: #fff; }
.auth-feature-sub   { display: block; font-size: 11.5px; color: rgba(255,255,255,.4); }

.auth-left-stats { display: flex; gap: 2rem; padding-top: .75rem; border-top: 1px solid rgba(255,255,255,.08); }
.auth-stat { display: flex; flex-direction: column; gap: 3px; }
.auth-stat-num   { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -.5px; }
.auth-stat-label { font-size: 11px; color: rgba(255,255,255,.35); font-weight: 500; text-transform: uppercase; letter-spacing: .06em; }

/* ── Right ── */
.auth-right {
  flex: 1; background: #fafaf8;
  display: flex; align-items: center; justify-content: center;
  padding: 2.5rem 2rem; overflow-y: auto;
}
.auth-form-wrap { width: 100%; max-width: 420px; }
.auth-form-head { margin-bottom: 1.75rem; }
.auth-form-title { font-size: 24px; font-weight: 700; color: #111; letter-spacing: -.4px; margin-bottom: 6px; }
.auth-form-sub   { font-size: 14px; color: #aaa; }

.auth-form  { display: flex; flex-direction: column; gap: 14px; }
.auth-row2  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.auth-field { display: flex; flex-direction: column; gap: 5px; }
.auth-label { font-size: 12.5px; font-weight: 600; color: #555; }

.auth-input-wrap { position: relative; }
.auth-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #c0c0bb; pointer-events: none; }
.auth-input {
  width: 100%; padding: 10px 12px;
  font-size: 13.5px; background: #fff;
  border: 1px solid #e0e0dc; border-radius: 10px;
  color: #111; font-family: inherit;
  transition: border-color .12s, box-shadow .12s; outline: none;
}
.auth-input-iconed { padding-left: 38px; padding-right: 38px; }
.auth-input:focus  { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.auth-input::placeholder { color: #c0c0bb; }
.auth-input-err    { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,.1) !important; }
.auth-err { font-size: 11.5px; color: #ef4444; font-weight: 500; }

.auth-eye {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #bbb;
  display: flex; align-items: center; padding: 2px; transition: color .12s;
}
.auth-eye:hover { color: #666; }

/* Password strength */
.auth-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.auth-strength-bars { display: flex; gap: 4px; flex: 1; }
.auth-strength-bar  { flex: 1; height: 4px; border-radius: 2px; background: #e8e8e5; transition: background .2s; }
.auth-strength-bar.str-weak   { background: #ef4444; }
.auth-strength-bar.str-fair   { background: #f59e0b; }
.auth-strength-bar.str-good   { background: #3b82f6; }
.auth-strength-bar.str-strong { background: #10b981; }
.auth-strength-label { font-size: 11px; font-weight: 600; white-space: nowrap; }
.str-1 { color: #ef4444; }
.str-2 { color: #f59e0b; }
.str-3 { color: #3b82f6; }
.str-4 { color: #10b981; }

/* Checkbox */
.auth-check-wrap {
  display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
}
.auth-check-wrap input[type="checkbox"] { display: none; }
.auth-check-box {
  width: 17px; height: 17px; border: 1.5px solid #ddddd8; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; background: #fff; margin-top: 1px;
  transition: all .12s; color: #fff;
}
.auth-check-wrap input:checked ~ .auth-check-box { background: #6366f1; border-color: #6366f1; }
.auth-check-label { font-size: 13px; color: #666; line-height: 1.5; }
.auth-check-label a { color: #6366f1; text-decoration: none; font-weight: 500; }
.auth-check-label a:hover { text-decoration: underline; }

.auth-submit {
  width: 100%; padding: 12px; background: #111; color: #fff;
  border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .14s;
  display: flex; align-items: center; justify-content: center; min-height: 46px;
}
.auth-submit:hover:not(:disabled) { background: #2d2d2d; }
.auth-submit:disabled { opacity: .6; cursor: not-allowed; }

.auth-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch { font-size: 13px; color: #aaa; text-align: center; }
.auth-switch a { color: #6366f1; font-weight: 600; text-decoration: none; }
.auth-switch a:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .auth-left  { display: none; }
  .auth-right { padding: 2rem 1.25rem; background: #fff; }
  .auth-row2  { grid-template-columns: 1fr; }
}
</style>