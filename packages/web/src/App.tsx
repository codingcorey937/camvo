import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Browse } from './pages/Browse'
import { CreatorDetail } from './pages/CreatorDetail'
import { MyBookings } from './pages/MyBookings'
import { CallRoom } from './pages/CallRoom'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/browse" element={
                <ProtectedRoute><Browse /></ProtectedRoute>
              } />
              <Route path="/creators/:id" element={<CreatorDetail />} />
              <Route path="/bookings" element={
                <ProtectedRoute><MyBookings /></ProtectedRoute>
              } />
              <Route path="/call/:roomName" element={
                <ProtectedRoute><CallRoom /></ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}