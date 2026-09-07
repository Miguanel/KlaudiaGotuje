import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// USUNIĘTE: import tailwindcss from ... (ponieważ nie jest używane w pliku konfiguracyjnym)

export default defineConfig({
  plugins: [react()],
})