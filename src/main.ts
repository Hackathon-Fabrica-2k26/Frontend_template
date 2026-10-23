import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import App from './App.vue'
import 'modern-normalize/modern-normalize.css'
import 'unfonts.css'
import 'vue3-toastify/dist/index.css'
import '@/styles/main.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
