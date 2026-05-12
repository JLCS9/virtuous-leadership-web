import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n'
import { initAnalytics } from './lib/analytics'

// Inicializa Google Analytics. No-op si VITE_GA_ID no esta definido.
initAnalytics();

// El orden importa:
//   - HelmetProvider gestiona <head> a nivel raiz.
//   - BrowserRouter va por encima del I18nProvider porque el provider lee
//     el idioma desde la URL (useLocation) y permite cambiar idioma via navigate.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <I18nProvider>
          <App />
        </I18nProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
