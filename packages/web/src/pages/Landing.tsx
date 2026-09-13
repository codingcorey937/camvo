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
              Book Video Calls
              <br />
              <span className="gradient-text">with Top Creators</span>
            </h1>
            <p className="text-xl text-dark-200 mb-10 max-w-2xl mx-auto">
              Pay per minute. Connect face-to-face. No subscriptions, no commitments.
              Just real conversations with the people who inspire you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? '/browse' : '/signup'}
                className="btn-primary text-lg px-10 py-4"
              >
                {user ? 'Browse Creators' : 'Get Started Free'}
              </Link>
              <Link to="/browse" className="btn-secondary text-lg px-10 py-4">
                Explore Creators
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-dark-200 text-center mb-16 max-w-xl mx-auto">
            Three simple steps to connect with your favorite creators
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse Creators', desc: 'Explore talented creators, see their pricing, and find the perfect match for your needs.' },
              { step: '02', title: 'Book a Session', desc: 'Pick a duration, enter your phone, and pay securely — only for the time you book.' },
              { step: '03', title: 'Connect Live', desc: 'Join a private video call directly in your browser. No apps to download.' },
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
              { title: 'Pay Per Minute', desc: 'Only pay for the time you book. No monthly fees, no hidden costs.' },
              { title: 'Instant Booking', desc: 'Book a session in seconds. No waiting for approval.' },
              { title: 'Secure Payments', desc: 'All payments handled securely by Stripe. Your info is safe.' },
              { title: 'Browser-Based', desc: 'Join calls directly from your browser. Works on any device.' },
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
            Ready to connect with<br />amazing creators?
          </h2>
          <p className="text-dark-200 mb-10 text-lg">
            Join Camvo today and start booking face-to-face video calls.
          </p>
          <Link
            to={user ? '/browse' : '/signup'}
            className="btn-primary text-lg px-12 py-4"
          >
            {user ? 'Browse Creators' : 'Create Your Account'}
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