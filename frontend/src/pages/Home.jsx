import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center animate-fadeIn">
        <h1 className="font-display text-4xl md:text-5xl text-espresso mb-6 leading-tight">
          Your Posts Deserve<br />
          <span className="italic text-sepia">an Audience</span>
        </h1>

        <p className="font-body text-xl text-ink/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          LinkedIn rewards posts that get early engagement. EngagePod notifies your trusted
          circle the moment you publish—so they can like, comment, and boost your reach
          when it matters most.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-espresso text-parchment font-body font-semibold text-lg
                       hover:bg-espresso-light transition-all duration-200 shadow-card"
          >
            Join the Pod →
          </Link>

          <Link
            to="/submit"
            className="px-8 py-4 bg-transparent text-espresso font-body font-semibold text-lg
                       border-2 border-amber-coffee hover:bg-amber-coffee/10 transition-all duration-200"
          >
            Submit a Post
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-espresso mb-2">How It Works</h2>
          <p className="font-body text-ink/60">Three steps to better engagement</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Sign Up',
              description: 'Add your name and email. Takes 10 seconds.',
            },
            {
              step: '2',
              title: 'Post on LinkedIn',
              description: 'Write your post as usual. Copy the link when it\'s live.',
            },
            {
              step: '3',
              title: 'Alert Your Pod',
              description: 'Paste the link here. Everyone gets notified instantly.',
            }
          ].map((item, index) => (
            <div
              key={item.step}
              className={`text-center p-6 border border-amber-coffee/20 bg-parchment-light/30
                         opacity-0 animate-slideUp`}
              style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-amber-coffee
                            flex items-center justify-center bg-parchment">
                <span className="font-display text-xl text-sepia">{item.step}</span>
              </div>
              <h3 className="font-display text-xl text-espresso mb-2">{item.title}</h3>
              <p className="font-body text-ink/70">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="border-2 border-amber-coffee/30 bg-parchment-light/50 p-8 md:p-10">
        <h2 className="font-display text-2xl md:text-3xl text-espresso mb-4 text-center">
          The First Hour Makes or Breaks Your Post
        </h2>

        <div className="font-body text-ink/80 space-y-4 text-lg leading-relaxed max-w-2xl mx-auto">
          <p>
            LinkedIn's algorithm watches what happens in the first 30-60 minutes.
            Posts that get quick engagement get pushed to thousands. Posts that don't?
            They disappear.
          </p>
          <p>
            EngagePod is like having a group chat for your LinkedIn network—except
            instead of hoping people see your message, everyone gets an email the
            moment you post. Real people, real engagement, real results.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-espresso text-parchment font-body font-semibold
                       hover:bg-espresso-light transition-all duration-200"
          >
            Get Started Free →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
