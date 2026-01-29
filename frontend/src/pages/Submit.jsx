import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Submit() {
  const location = useLocation();
  const welcomeState = location.state;

  const [formData, setFormData] = useState({
    email: welcomeState?.email || '',
    linkedin_url: '',
    note: ''
  });
  const [status, setStatus] = useState({ type: '', message: '', details: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(welcomeState?.welcome || false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
  const progressInterval = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '', details: null });
    setSendingProgress({ current: 0, total: 0 });

    try {
      // First, get member count to show progress
      const membersRes = await fetch('/api/members');
      const membersData = await membersRes.json();
      // Subtract 1 because the poster doesn't get notified
      const recipientCount = Math.max(0, (membersData.members?.length || 1) - 1);

      setSendingProgress({ current: 0, total: recipientCount });

      // Start progress ticker (600ms per email)
      let currentCount = 0;
      progressInterval.current = setInterval(() => {
        currentCount++;
        if (currentCount <= recipientCount) {
          setSendingProgress(prev => ({ ...prev, current: currentCount }));
        }
      }, 650); // Slightly longer than backend delay to stay behind actual progress

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Clear the progress interval
      clearInterval(progressInterval.current);
      progressInterval.current = null;

      const data = await response.json();

      if (response.ok) {
        setSendingProgress({ current: data.notifications.sent, total: data.notifications.total_members });
        setStatus({
          type: 'success',
          message: 'Done! Your pod has been notified.',
          details: data.notifications
        });
        setFormData(prev => ({ ...prev, linkedin_url: '', note: '' }));
      } else {
        setSendingProgress({ current: 0, total: 0 });
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.'
        });
      }
    } catch (err) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setSendingProgress({ current: 0, total: 0 });
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
      {/* Welcome banner for new registrations */}
      {showWelcome && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded relative">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-2 right-2 text-green-600 hover:text-green-800"
            aria-label="Dismiss"
          >
            &times;
          </button>
          <p className="font-body text-green-800">
            <span className="font-semibold">You're in, {welcomeState?.name}!</span>{' '}
            You'll get an email whenever someone in the pod posts. Now submit your first post below.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-espresso mb-3">
          Submit Your Post
        </h1>
        <p className="font-body text-ink/70 text-lg">
          Notify your pod so they can engage while it's fresh
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-amber-coffee/30 bg-parchment-light/50 p-6 space-y-5">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block font-body font-semibold text-espresso text-sm mb-2"
            >
              Your Email
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
              The email you registered with
            </p>
          </div>

          {/* LinkedIn URL field */}
          <div>
            <label
              htmlFor="linkedin_url"
              className="block font-body font-semibold text-espresso text-sm mb-2"
            >
              LinkedIn Post URL
            </label>
            <input
              type="url"
              id="linkedin_url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              required
              className="ledger-input w-full"
              placeholder="https://linkedin.com/posts/..."
            />
          </div>

          {/* Note field */}
          <div>
            <label
              htmlFor="note"
              className="block font-body font-semibold text-espresso text-sm mb-2"
            >
              Note to the Pod
              <span className="font-normal text-ink/50 ml-1">(optional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="ledger-input w-full resize-none"
              placeholder="Would love comments on this one..."
            />
          </div>

          {/* Sending progress */}
          {isSubmitting && sendingProgress.total > 0 && (
            <div className="p-4 rounded bg-blue-50 border border-blue-200 text-blue-800">
              <p className="font-body text-sm">
                Sending notifications...
              </p>
              <p className="font-body text-xs mt-1 opacity-80">
                {sendingProgress.current} of {sendingProgress.total} members notified
              </p>
            </div>
          )}

          {/* Status message */}
          {status.message && !isSubmitting && (
            <div
              className={`p-4 rounded ${
                status.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-body text-sm">{status.message}</p>
              {status.details && (
                <p className="font-body text-xs mt-1 opacity-80">
                  Notified {status.details.sent} of {status.details.total_members} members
                </p>
              )}
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
          {isSubmitting
            ? (sendingProgress.total > 0
                ? `Sending ${sendingProgress.current}/${sendingProgress.total}...`
                : 'Preparing...')
            : 'Notify the Pod →'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center mt-6 font-body text-ink/50 text-sm">
        Not registered yet?{' '}
        <Link to="/register" className="text-sepia hover:text-espresso underline">
          Join the pod first
        </Link>
      </p>
    </div>
  );
}

export default Submit;
