<!-- PremiumLoader.vue -->
<template>
  <!-- No Teleport — renders inside parent -->
  <Transition name="loader-fade">
    <div v-if="active" class="loader-backdrop">
      <div class="loader-box">
        <div class="loader-ring">
          <svg viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="23"
              stroke="#f0f0ec" stroke-width="4"/>
            <circle cx="28" cy="28" r="23"
              stroke="url(#loaderGrad)" stroke-width="4"
              stroke-linecap="round"
              stroke-dasharray="80 65"
              class="loader-arc"/>
            <defs>
              <linearGradient id="loaderGrad"
                x1="0" y1="0" x2="56" y2="56"
                gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#a5b4fc"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="loader-center-icon">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
        </div>
        <p class="loader-text">{{ text }}</p>
        <div class="loader-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'PremiumLoader',
  props: {
    active: { type: Boolean, default: false },
    text:   { type: String,  default: 'Loading' },
  },
};
</script>

<style scoped>
/* Scoped to parent — position: absolute */
.loader-backdrop {
  position: absolute;       /* ← was fixed */
  inset: 0;
  z-index: 9999;
  background: rgba(245,245,243, 0.45); /* ← was 0.82 */
  backdrop-filter: blur(3px);         /* ← was 6px  */
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
.loader-ring { position:relative; width:72px; height:72px;
  display:flex; align-items:center; justify-content:center; }
.loader-ring svg { width:72px; height:72px; animation:spin 1.1s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loader-center-icon {
  position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center;
  font-size:22px; color:#6366f1;
  animation:pulse 1.1s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.6; transform:scale(0.88); }
}
.loader-text { font-size:13px; font-weight:600; color:#555; margin:0; }
.loader-dots { display:flex; gap:5px; }
.loader-dots span { width:5px; height:5px; border-radius:50%;
  background:#6366f1; opacity:0.3; animation:dot-bounce 1.2s ease-in-out infinite; }
.loader-dots span:nth-child(1) { animation-delay:0s; }
.loader-dots span:nth-child(2) { animation-delay:0.2s; }
.loader-dots span:nth-child(3) { animation-delay:0.4s; }
@keyframes dot-bounce {
  0%,80%,100% { opacity:0.2; transform:scale(0.8); }
  40% { opacity:1; transform:scale(1.2); }
}
.loader-fade-enter-active,
.loader-fade-leave-active { transition: opacity 0.22s ease; }
.loader-fade-enter-from,
.loader-fade-leave-to { opacity: 0; }
</style>