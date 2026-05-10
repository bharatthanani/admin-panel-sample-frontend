// main.js
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth';
import { vPermission } from '@/directives/permission';
import { vRole } from '@/directives/role';

import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import Loading from 'vue3-loading-overlay';
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// IMPORTANT
const auth = useAuthStore(pinia)
auth.init()

app.use(router)

// DIRECTIVES
app.directive('permission', vPermission)
app.directive('role', vRole)

// TOAST
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 5000
})

// GLOBAL COMPONENTS
app.component('Loading', Loading)
app.component('Multiselect', Multiselect)

app.mount('#app')