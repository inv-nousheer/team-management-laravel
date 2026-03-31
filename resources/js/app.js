import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import '../css/app.css'


const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Load user from storage before mounting
const auth = useAuthStore()
auth.loadUserFromStorage()

app.mount('#app')
