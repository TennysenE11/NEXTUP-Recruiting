import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Web fonts load at runtime so the site still bundles into one file; system fonts show until they arrive.
const fonts = document.createElement('link')
fonts.rel = 'stylesheet'
fonts.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap'
document.head.appendChild(fonts)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
