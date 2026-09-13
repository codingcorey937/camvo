import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Landing() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Your Link to Book<br />
              <span className="gradient-text">Video Calls with Clients</span>
            </h1>
            <p className="text-xl text-dark-200 mb-10 max-w-2xl mx-auto">
              Get a custom link like <span className="text-primary font-semibold">camvo.online/c/your-name</span>.
              Share it with clients. They book and pay — no account needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? '/creator/dashboard' : '/creator/signup'} className="btn-primary text-lg px-10 py-4">
                {user ? 'Go to Dashboard' : 'Become a Creator'}
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-10 py-4">How It Works</a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">How It Works for Creators</h2>
          <p className="text-dark-200 text-center mb-16 max-w-xl mx-auto">
            Three simple steps to start getting paid for video calls
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Page', desc: 'Sign up and set your pricing, bio, and availability in minutes.' },
              { step: '02', title: 'Share Your Link', desc: 'Get a custom link like camvo.online/c/your-name. Send it to clients.' },
              { step: '03', title: 'Get Booked & Paid', desc: 'Clients book, pay, and join a video call. You keep 87.5% after fees.' },
            ].map((item) => (
              <div key={item.step} className="card text-center p-8">
                <div className="text-primary text-4xl font-black mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-dark-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-dark-700 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Why Camvo?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Custom Booking Link', desc: 'Your own page at camvo.online/c/your-name. Share it anywhere.' },
              { title: 'No Client Signup', desc: 'Clients book in seconds. No accounts, no friction.' },
              { title: 'Secure Payments', desc: 'Payments handled by Stripe. Automatic payouts to you.' },
              { title: 'Browser Video Calls', desc: 'Calls happen in the browser. No app downloads needed.' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-dark-300 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to start taking bookings?
          </h2>
          <p className="text-dark-200 mb-10 text-lg">
            Create your page in minutes and start getting booked.
          </p>
          <Link to={user ? '/creator/dashboard' : '/creator/signup'} className="btn-primary text-lg px-12 py-4">
            {user ? 'Go to Dashboard' : 'Create Your Creator Page'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-dark-400 text-sm">
          Camvo &copy; {new Date().getFullYear()} — Book video calls with creators.
        </div>
      </footer>
    </div>
  )
}