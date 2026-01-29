import { Outlet, Link, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linkedin rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EP</span>
              </div>
              <span className="font-semibold text-gray-900">EngagePod</span>
            </Link>

            <nav className="flex gap-4">
              <Link
                to="/register"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/register')
                    ? 'bg-linkedin text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Join
              </Link>
              <Link
                to="/submit"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/submit')
                    ? 'bg-linkedin text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Submit Post
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          EngagePod - Support your LinkedIn pod, get supported back.
        </div>
      </footer>
    </div>
  );
}

export default Layout;
