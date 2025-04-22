import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/DL-roboflow-pet-classifier-2024-fall/',
  plugins: [vue()],
})
