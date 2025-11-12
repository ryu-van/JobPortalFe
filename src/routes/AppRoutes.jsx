import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import VerifyEmail from '../pages/VerifyEmail'
import Register from '../pages/Register'
export default function AppRoutes(){
  return (
    <Router>
        <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </Router>
  )
}

