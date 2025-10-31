import App from '@app/App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
