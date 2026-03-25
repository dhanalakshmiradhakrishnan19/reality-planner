import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Set theme before app loads to prevent black screen
const savedTheme = localStorage.getItem("theme") || "system";
const activeTheme = savedTheme === "system"
  ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  : savedTheme;
document.body.setAttribute("data-theme", activeTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)