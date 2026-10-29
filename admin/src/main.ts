import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// 管理端入口（admin 联动批次 1）：Element Plus 全量引入——练手项目体量小，
// 不做按需导入的复杂度权衡（与 C 端 app 第一批移除 EP 的决策互不影响，
// 管理端表格/表单/对话框是 EP 的主场）。
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
