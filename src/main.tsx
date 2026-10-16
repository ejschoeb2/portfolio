import '@fontsource/be-vietnam-pro/latin-400.css'
import '@fontsource/be-vietnam-pro/latin-500.css'
import '@fontsource/be-vietnam-pro/latin-600.css'
import '@fontsource/be-vietnam-pro/latin-700.css'
import '@fontsource/be-vietnam-pro/latin-800.css'
import 'lenis/dist/lenis.css'
import './styles/base.css'
import './styles/card.css'
import './styles/home.css'
import './styles/project.css'

import { createRoot } from 'react-dom/client'
import App from './App'

history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(<App />)
