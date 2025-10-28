import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-[90vw] md:w-[70vw] lg:w-[60vw] bg-white/80 backdrop-blur-sm border rounded-xl p-[4vw] md:p-8 shadow">
        <h1 className="text-[8vw] md:text-3xl font-bold text-gray-800 text-center">Sajilo Kaam</h1>
        <p className="text-[4vw] md:text-base text-gray-600 text-center mt-[2vh]">Freelance Management System</p>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
