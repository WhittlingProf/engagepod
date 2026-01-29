import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2C1810' }}>
      {/* Header - explicit light background */}
      <header style={{ backgroundColor: '#FFF8E7', borderBottom: '3px solid #C4A77D' }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {/* Logo */}
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(145deg, #8B4513, #5D2E0C)' }}
              >
                <span style={{ color: '#FFF8E7', fontWeight: 'bold', fontSize: '14px' }}>EP</span>
              </div>
              <span
                className="text-xl font-semibold"
                style={{ color: '#2C1810', fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                EngagePod
              </span>
            </Link>

            <nav className="flex gap-2">
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold rounded transition-all duration-200"
                style={{
                  backgroundColor: isActive('/register') ? '#2C1810' : 'transparent',
                  color: isActive('/register') ? '#FFF8E7' : '#2C1810',
                  border: '2px solid #2C1810',
                  fontFamily: 'Crimson Text, Georgia, serif'
                }}
              >
                Join
              </Link>
              <Link
                to="/submit"
                className="px-5 py-2.5 text-sm font-semibold rounded transition-all duration-200"
                style={{
                  backgroundColor: isActive('/submit') ? '#2C1810' : 'transparent',
                  color: isActive('/submit') ? '#FFF8E7' : '#2C1810',
                  border: '2px solid #2C1810',
                  fontFamily: 'Crimson Text, Georgia, serif'
                }}
              >
                Submit Post
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="paper-bg rounded shadow-parchment p-8 md:p-12 min-h-[60vh]">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(196, 167, 125, 0.2)' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p
            className="text-center text-sm"
            style={{ color: 'rgba(245, 230, 211, 0.5)', fontFamily: 'Crimson Text, Georgia, serif' }}
          >
            EngagePod — Where your network gathers to support each other
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
