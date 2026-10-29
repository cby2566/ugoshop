import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles/base.css'
import './styles/homepage.css'
import './styles/homepage_main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
