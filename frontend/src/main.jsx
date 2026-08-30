import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Css/theme.css'
import App from './App.jsx'
import { applyTheme, getSettings } from './data/Settingsstore'

applyTheme(getSettings().darkMode)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
