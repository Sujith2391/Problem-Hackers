import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Import the router
import { AuthProvider } from './contexts/AuthContext' // Import our auth provider
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>   {/* 1. Add the router */}
      <AuthProvider>  {/* 2. Add our auth provider */}
        <App />       {/* 3. Render the app */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)