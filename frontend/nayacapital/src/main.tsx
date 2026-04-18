import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = 'ERROR: Root element not found'
} else {
  try {
    const reactRoot = createRoot(root)
    reactRoot.render(createElement(ErrorBoundary, null, createElement(App)))
  } catch (error) {
    console.error('React render error:', error)
    document.body.innerHTML = `<div style="color:red;padding:20px"><h1>ERROR:</h1><p>${String(error)}</p></div>`
  }
}
