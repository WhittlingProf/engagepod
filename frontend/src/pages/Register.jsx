import { useState } from 'react';

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
          message: 'You\'re in! You\'ll receive email notifications when pod members post.'
        });
        setFormData({ name: '', email: '' });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Registration failed. Please try again.'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join the Pod</h1>
        <p className="text-gray-600">
          Register to receive notifications when pod members post on LinkedIn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin focus:border-transparent outline-none transition-shadow"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
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
        </div>

        {status.message && (
          <div
            className={`p-4 rounded-lg ${
              status.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-linkedin text-white font-medium rounded-lg hover:bg-linkedin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Registering...' : 'Join the Pod'}
        </button>
      </form>
    </div>
  );
}

export default Register;
