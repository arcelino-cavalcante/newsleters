import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ModalProvider } from './components/ModalProvider'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ModalProvider>
        <App />
      </ModalProvider>
    </HashRouter>
  </StrictMode>,
)
