import { useState, useEffect, useRef } from 'react';

function Admin() {
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('adminPass'));
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Broadcast email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const progressInterval = useRef(null);

  const getAdminHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'x-admin-password': sessionStorage.getItem('adminPass') || '',
    ...extra,
  });

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!authed) return;

    async function fetchData() {
      try {
        const [membersRes, postsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/posts')
        ]);

        if (!membersRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const membersData = await membersRes.json();
        const postsData = await postsRes.json();

        setMembers(membersData.members || []);
        setPosts(postsData.posts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setPassError('');

    try {
      const res = await fetch('/api/survey/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': passInput,
        },
      });

      if (res.ok) {
        sessionStorage.setItem('adminPass', passInput);
        setAuthed(true);
      } else {
        setPassError('Wrong password');
      }
    } catch {
      setPassError('Could not connect');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    // SQLite CURRENT_TIMESTAMP is UTC but lacks a Z suffix
    const utcDate = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(utcDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} (${member.email}) from the pod?`)) return;

    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.status === 401) { sessionStorage.removeItem('adminPass'); setAuthed(false); return; }
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== member.id));
      }
    } catch (err) {
      alert('Failed to delete member');
    }
  };

  const handleSendTest = async () => {
    if (!emailSubject || !emailMessage) return;
    setEmailTesting(true);
    setEmailResult(null);

    try {
      const res = await fetch('/api/survey/test', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      });
      if (res.status === 401) { sessionStorage.removeItem('adminPass'); setAuthed(false); return; }
      const data = await res.json();
      if (!res.ok) {
        setEmailResult({ error: data.error });
      } else {
        setEmailResult({ success: true, test: true, ...data });
      }
    } catch (err) {
      setEmailResult({ error: err.message });
    } finally {
      setEmailTesting(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);

    const total = members.length;
    setSendProgress({ current: 0, total });

    let currentCount = 0;
    progressInterval.current = setInterval(() => {
      currentCount++;
      if (currentCount <= total) {
        setSendProgress(prev => ({ ...prev, current: currentCount }));
      }
    }, 650);

    try {
      const res = await fetch('/api/survey/send', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      });

      clearInterval(progressInterval.current);
      progressInterval.current = null;

      if (res.status === 401) { sessionStorage.removeItem('adminPass'); setAuthed(false); return; }

      const data = await res.json();

      if (!res.ok) {
        setSendProgress({ current: 0, total: 0 });
        setEmailResult({ error: data.error });
      } else {
        setSendProgress({ current: data.successful, total: data.total });
        setEmailResult({ success: true, ...data });
      }
    } catch (err) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
      setSendProgress({ current: 0, total: 0 });
      setEmailResult({ error: err.message });
    } finally {
      setEmailSending(false);
    }
  };

  // --- Password gate ---
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-24">
        <h1 className="font-display text-2xl text-espresso mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border border-amber-coffee/30 bg-white font-body text-ink focus:outline-none focus:border-sepia"
          />
          {passError && (
            <p className="font-body text-red-600 text-sm">{passError}</p>
          )}
          <button
            type="submit"
            disabled={verifying}
            className="w-full py-2 bg-espresso text-parchment font-body hover:bg-espresso/90 transition-colors disabled:opacity-50"
          >
            {verifying ? 'Checking...' : 'Log In'}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-ink/60">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="font-display text-3xl text-espresso mb-2">Admin Dashboard</h1>
        <p className="font-body text-ink/60">Quick view of database contents</p>
      </div>

      {/* Members Section */}
      <section>
        <h2 className="font-display text-2xl text-espresso mb-4 flex items-center gap-2">
          Members
          <span className="text-base font-body text-ink/50">({members.length})</span>
        </h2>

        {members.length === 0 ? (
          <p className="font-body text-ink/60 italic">No members yet</p>
        ) : (
          <div className="border border-amber-coffee/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-parchment-light">
                <tr className="text-left font-body text-sm text-ink/70">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-coffee/10">
                {members.map((member) => (
                  <tr key={member.id} className="font-body text-ink/80 hover:bg-parchment-light/50">
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3 text-sm">{member.email}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(member.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 ${
                        member.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="text-xs text-red-500 hover:text-red-700 font-body"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Send Email Section */}
      <section>
        <h2 className="font-display text-2xl text-espresso mb-4">Send Email</h2>
        <p className="font-body text-ink/60 mb-4">
          Send an email to all {members.length} active member{members.length !== 1 ? 's' : ''}.
        </p>

        <form onSubmit={handleSendEmail} className="space-y-4 max-w-lg">
          <div>
            <label className="block font-body text-sm text-ink/70 mb-1">Subject</label>
            <input
              type="text"
              required
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-amber-coffee/30 bg-white font-body text-ink focus:outline-none focus:border-sepia"
            />
          </div>

          <div>
            <label className="block font-body text-sm text-ink/70 mb-1">Message</label>
            <textarea
              required
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-amber-coffee/30 bg-white font-body text-ink focus:outline-none focus:border-sepia"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={emailTesting || emailSending || !emailSubject || !emailMessage}
              className="px-6 py-2 border border-espresso text-espresso font-body hover:bg-espresso/10 transition-colors disabled:opacity-50"
            >
              {emailTesting ? 'Sending test...' : 'Send Test'}
            </button>
            <button
              type="submit"
              disabled={emailSending || emailTesting}
              className="px-6 py-2 bg-espresso text-parchment font-body hover:bg-espresso/90 transition-colors disabled:opacity-50"
            >
              {emailSending
                ? `Sending ${sendProgress.current}/${sendProgress.total}...`
                : `Send to All ${members.length}`}
            </button>
          </div>
        </form>

        {emailResult && (
          <div className={`mt-4 p-4 font-body text-sm ${
            emailResult.error
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {emailResult.error
              ? `Error: ${emailResult.error}`
              : emailResult.test
                ? 'Test sent to your email'
                : `Sent to ${emailResult.successful} of ${emailResult.total} members${emailResult.failed > 0 ? ` (${emailResult.failed} failed)` : ''}`
            }
          </div>
        )}
      </section>

      {/* Posts Section */}
      <section>
        <h2 className="font-display text-2xl text-espresso mb-4 flex items-center gap-2">
          Recent Posts
          <span className="text-base font-body text-ink/50">({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <p className="font-body text-ink/60 italic">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-amber-coffee/20 p-4 bg-parchment-light/30"
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <span className="font-body font-semibold text-espresso">{post.member_name}</span>
                    <span className="font-body text-ink/50 text-sm ml-2">({post.member_email})</span>
                  </div>
                  <span className="font-body text-ink/50 text-sm whitespace-nowrap">
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <a
                  href={post.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sepia hover:underline text-sm break-all"
                >
                  {post.linkedin_url}
                </a>

                {post.note && (
                  <p className="font-body text-ink/70 text-sm mt-2 italic">
                    "{post.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Admin;
