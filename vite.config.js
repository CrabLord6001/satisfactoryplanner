import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: Change 'satisfactory-planner' below to match your GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/satisfactory-planner/',
})
