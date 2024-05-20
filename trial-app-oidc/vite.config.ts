import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir:"./build"
  },
  server: {
    port: 3092,
  },
  plugins: [react()],
})
