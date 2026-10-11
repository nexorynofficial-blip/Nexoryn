import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount only after the browser has painted once. index.html's static intro
// plate (and the home page's intro text under it) are then on screen first,
// even when this script arrives before the first frame; the app's own,
// identical plate replaces them one frame later. Costs one frame at most.
// (The timer covers background tabs, where animation frames don't run.)
let mounted = false
const render = () => {
  if (mounted) return
  mounted = true
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
const mount = () => {
  requestAnimationFrame(() => setTimeout(render))
  setTimeout(render, 500)
}

// In the production build the stylesheet arrives as media="print" so it
// doesn't block the first paint (see nonBlockingCss in vite.config.js).
// Switch it on, and render once it has loaded so nothing appears unstyled.
// It was requested at high priority alongside this script, so this is
// normally already done. (No such link in dev: Vite injects the CSS itself.)
const css = document.getElementById('app-css')
if (!css || css.sheet) {
  if (css) css.media = 'all'
  mount()
} else {
  let started = false
  const start = () => {
    if (started) return
    started = true
    mount()
  }
  css.addEventListener('load', start, { once: true })
  // A failed stylesheet shouldn't leave the page blank.
  css.addEventListener('error', start, { once: true })
  css.media = 'all'
}
