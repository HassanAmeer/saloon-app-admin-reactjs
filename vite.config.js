import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to automatically copy php-smtp folder into dist on build
function copyPhpSmtpPlugin() {
  return {
    name: 'copy-php-smtp',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'php-smtp')
      const destDir = path.resolve(__dirname, 'dist', 'php-smtp')
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true })
        console.log('\n[copy-php-smtp] Successfully copied php-smtp to dist/php-smtp')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyPhpSmtpPlugin()],
})

