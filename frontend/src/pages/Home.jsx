import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Support Your Pod, Get Supported Back
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          LinkedIn's algorithm rewards early engagement. EngagePod notifies your trusted group
          the moment you post, so they can support you when it matters most.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-6 py-3 bg-linkedin text-white font-medium rounded-lg hover:bg-linkedin-dark transition-colors"
          >
            Join the Pod
          </Link>
          <Link
            to="/submit"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Submit a Post
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-linkedin">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
            <p className="text-gray-600">
              Sign up with your name and email to join the pod.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-linkedin">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Post on LinkedIn</h3>
            <p className="text-gray-600">
              Create your LinkedIn post as usual, then copy the link.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-linkedin">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Submit & Notify</h3>
            <p className="text-gray-600">
              Paste your link here. Everyone in the pod gets notified instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why the First Hour Matters</h2>
        <p className="text-gray-600 mb-4">
          LinkedIn's algorithm decides whether to amplify your content based on early signals.
          Posts that get meaningful engagement in the first 30-60 minutes are far more likely
          to reach a wider audience.
        </p>
        <p className="text-gray-600">
          EngagePod helps your trusted group coordinate to support each other during this
          critical window. No automation, no fake engagement - just real humans helping
          each other authentically.
        </p>
      </section>
    </div>
  );
}

export default Home;
