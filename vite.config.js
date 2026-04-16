import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: './',
=======
  base: '/',           // ← Change this from './' to '/'
  build: {
    outDir: 'dist'
  }
>>>>>>> cac3b5c43248ecd3aa5e7609648e33f3814e3843
})
