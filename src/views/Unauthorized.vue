<template>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#f5f5f3">
    <div style="background:#fff;border:1px solid #e8e8e5;border-radius:16px;padding:3rem;text-align:center;max-width:420px">
      <div style="width:64px;height:64px;background:#fdecea;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:28px;color:#ef4444">
        🔒
      </div>
      <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Access Denied</h2>
      <p style="font-size:14px;color:#888;margin:0 0 1.5rem;line-height:1.6">
        You don't have permission to view this page. Contact your administrator if you think this is a mistake.
      </p>
      <router-link
        to="/admin/dashboard"
        style="display:inline-block;padding:10px 24px;background:#111;color:#fff;border-radius:9px;text-decoration:none;font-size:13px;font-weight:600">
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>