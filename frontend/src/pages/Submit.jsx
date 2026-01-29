import { useState } from 'react';

function Submit() {
  const [formData, setFormData] = useState({ email: '', linkedin_url: '', note: '' });
  const [status, setStatus] = useState({ type: '', message: '', details: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '', details: null });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Post submitted! Your pod has been notified.',
          details: data.notifications
        });
        setFormData({ email: '', linkedin_url: '', note: '' });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Submission failed. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Post</h1>
        <p className="text-gray-600">
          Share your LinkedIn post URL to notify pod members.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent outline-none transition-shadow"
            placeholder="jane@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">Use the email you registered with</p>
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Post URL
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent outline-none transition-shadow"
            placeholder="https://linkedin.com/posts/..."
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent outline-none transition-shadow resize-none"
            placeholder="Would love comments on this one! It's about..."
          />
        </div>

        {status.message && (
          <div
            className={`p-4 rounded-lg ${
              status.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p>{status.message}</p>
            {status.details && (
              <p className="text-sm mt-2">
                Notified {status.details.sent} of {status.details.total_members} members
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-linkedin text-white font-medium rounded-lg hover:bg-linkedin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Notify the Pod'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Not registered yet? <a href="/register" className="text-linkedin hover:underline">Join the pod first</a></p>
      </div>
    </div>
  );
}

export default Submit;
