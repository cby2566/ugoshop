<template>
  <el-container class="shell">
    <el-header class="header" height="56px">
      <span class="logo">优品惠 <span class="en">UGOShop</span></span>
      <span class="badge">rebuild · 脚手架就绪</span>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
    <el-footer class="footer" height="40px">
      UGOShop rebuild — 2018 未竟心愿的完工版
    </el-footer>
  </el-container>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.logo .en {
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.badge {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.main {
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
