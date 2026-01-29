import { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'You\'re in! You\'ll get an email whenever someone in the pod posts.'
        });
        setFormData({ name: '', email: '' });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Network error. Check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-espresso mb-3">
          Join the Pod
        </h1>
        <p className="font-body text-ink/70 text-lg">
          Get notified when your network posts. Support them, they support you.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-amber-coffee/30 bg-parchment-light/50 p-6 space-y-5">
          {/* Name field */}
          <div>
            <label
              htmlFor="name"
              className="block font-body font-semibold text-espresso text-sm mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              className="ledger-input w-full"
              placeholder="Jane Smith"
            />
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block font-body font-semibold text-espresso text-sm mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="ledger-input w-full"
              placeholder="jane@company.com"
            />
            <p className="font-body text-ink/50 text-xs mt-2">
              This is where you'll receive notifications
            </p>
          </div>

          {/* Status message */}
          {status.message && (
            <div
              className={`p-4 rounded ${
                status.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-body text-sm">{status.message}</p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-espresso text-parchment font-body font-semibold text-lg
                   hover:bg-espresso-light transition-all duration-200 shadow-card
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Joining...' : 'Join the Pod →'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center mt-6 font-body text-ink/50 text-sm">
        Already a member?{' '}
        <Link to="/submit" className="text-sepia hover:text-espresso underline">
          Submit a post
        </Link>
      </p>
    </div>
  );
}

export default Register;
