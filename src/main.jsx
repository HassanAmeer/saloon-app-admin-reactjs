import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { themeColors } from './config.js'

// Apply configuration colors dynamically to CSS custom variables
const root = document.documentElement;
root.style.setProperty('--primary', themeColors.primary);
root.style.setProperty('--primary-glow', themeColors.primaryGlow);
root.style.setProperty('--secondary', themeColors.accent100);
root.style.setProperty('--bg-dark', themeColors.background);
root.style.setProperty('--card-bg', themeColors.bgCard);
root.style.setProperty('--glass-border', themeColors.glassBorder);
root.style.setProperty('--text-main', themeColors.textMain);
root.style.setProperty('--text-muted', themeColors.textMuted);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
