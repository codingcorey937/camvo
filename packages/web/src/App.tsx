import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Landing } from './pages/Landing'
import { CreatorLogin } from './pages/CreatorLogin'
import { CreatorSignup } from './pages/CreatorSignup'
import { CreatorDashboard } from './pages/CreatorDashboard'
import { CreatorPublicPage } from './pages/CreatorPublicPage'
import { CallRoom } from './pages/CallRoom'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/creator/login" element={<CreatorLogin />} />
              <Route path="/creator/signup" element={<CreatorSignup />} />
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/c/:slug" element={<CreatorPublicPage />} />
              <Route path="/call/:roomName" element={<CallRoom />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}