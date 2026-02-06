import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

function Feed() {
  const [email, setEmail] = useState(sessionStorage.getItem('feedEmail') || '');
  const [member, setMember] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState('');

  const [posts, setPosts] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-identify if email was stored from a previous visit
  useEffect(() => {
    const stored = sessionStorage.getItem('feedEmail');
    if (stored) {
      lookupMember(stored);
    }
  }, []);

  // Fetch feed data
  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalMembers(data.total_members || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  async function lookupMember(emailToLookup) {
    setIdentifying(true);
    setIdentifyError('');
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(emailToLookup.toLowerCase())}`);
      if (!res.ok) {
        setIdentifyError('Email not found. Are you registered?');
        return;
      }
      const data = await res.json();
      setMember(data.member);
      sessionStorage.setItem('feedEmail', emailToLookup.toLowerCase());
      sessionStorage.setItem('feedMemberId', data.member.id);
    } catch {
      setIdentifyError('Could not connect');
    } finally {
      setIdentifying(false);
    }
  }

  const handleIdentify = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    lookupMember(email.trim());
  };

  const handleLogout = () => {
    setMember(null);
    setEmail('');
    sessionStorage.removeItem('feedEmail');
    sessionStorage.removeItem('feedMemberId');
  };

  async function toggleEngagement(postId, type) {
    if (!member) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const engagementList = post.engagements[type] || [];
    const alreadyEngaged = engagementList.some(e => e.member_id === member.id);

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const updated = { ...p, engagements: { ...p.engagements } };
      if (alreadyEngaged) {
        updated.engagements[type] = updated.engagements[type].filter(e => e.member_id !== member.id);
      } else {
        updated.engagements[type] = [
          ...updated.engagements[type],
          { member_id: member.id, member_name: member.name },
        ];
      }

      // Recalculate total_engaged
      const allIds = new Set([
        ...updated.engagements.liked.map(e => e.member_id),
        ...updated.engagements.commented.map(e => e.member_id),
      ]);
      updated.total_engaged = allIds.size;

      return updated;
    }));

    // Fire API call
    try {
      const res = await fetch('/api/engagements', {
        method: alreadyEngaged ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          member_id: member.id,
          engagement_type: type,
        }),
      });

      // If it fails (and isn't a 409 duplicate), revert
      if (!res.ok && res.status !== 409) {
        fetchFeed();
      }
    } catch {
      fetchFeed();
    }
  }

  function timeAgo(dateString) {
    const utcDate = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const diff = Date.now() - new Date(utcDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-ink/60">Loading feed...</p>
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
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-espresso mb-3">
          The Feed
        </h1>
        <p className="font-body text-ink/70 text-lg">
          Recent posts from the pod. Click through, engage, check in.
        </p>
      </div>

      {/* Identity bar */}
      <div className="mb-8 border border-amber-coffee/30 bg-parchment-light/50 p-4">
        {member ? (
          <div className="flex items-center justify-between">
            <p className="font-body text-ink/80">
              Viewing as <span className="font-semibold text-espresso">{member.name}</span>
            </p>
            <button
              onClick={handleLogout}
              className="font-body text-sm text-sepia hover:text-espresso underline"
            >
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={handleIdentify} className="space-y-2">
            <p className="font-body text-ink/70 text-sm mb-2">
              Enter your email to check in on posts
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="ledger-input flex-1"
              />
              <button
                type="submit"
                disabled={identifying}
                className="px-5 py-2 bg-espresso text-parchment font-body font-semibold
                         hover:bg-espresso-light transition-colors disabled:opacity-50"
              >
                {identifying ? '...' : 'Go'}
              </button>
            </div>
            {identifyError && (
              <p className="font-body text-red-600 text-sm">{identifyError}</p>
            )}
          </form>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-ink/60 italic mb-4">No posts in the last 7 days.</p>
          <Link
            to="/submit"
            className="inline-block px-6 py-3 bg-espresso text-parchment font-body font-semibold
                     hover:bg-espresso-light transition-colors"
          >
            Be the first to share
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isOwnPost = member && post.member_id === member.id;
            const likedByMe = member && post.engagements.liked.some(e => e.member_id === member.id);
            const commentedByMe = member && post.engagements.commented.some(e => e.member_id === member.id);

            return (
              <div
                key={post.id}
                className="border border-amber-coffee/20 p-5 bg-parchment-light/30"
              >
                {/* Author + time */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-espresso">{post.member_name}</span>
                    {isOwnPost && (
                      <span className="text-xs px-2 py-0.5 bg-amber-coffee/20 text-espresso/70 font-body">
                        Your post
                      </span>
                    )}
                  </div>
                  <span className="font-body text-ink/50 text-sm">{timeAgo(post.created_at)}</span>
                </div>

                {/* LinkedIn link */}
                <a
                  href={post.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-3 px-4 py-2 bg-espresso text-parchment font-body text-sm
                           hover:bg-espresso-light transition-colors"
                >
                  View on LinkedIn →
                </a>

                {/* Note */}
                {post.note && (
                  <p className="font-body text-ink/70 text-sm mb-3 italic">
                    "{post.note}"
                  </p>
                )}

                {/* Engagement summary */}
                <div className="border-t border-amber-coffee/15 pt-3 mt-3">
                  <p className="font-body text-ink/60 text-sm mb-2">
                    {post.total_engaged} of {post.total_members} engaged
                  </p>

                  {/* Names of who engaged */}
                  {post.engagements.liked.length > 0 && (
                    <p className="font-body text-ink/60 text-xs mb-1">
                      <span className="text-ink/80">Liked:</span>{' '}
                      {post.engagements.liked.map(e => e.member_name).join(', ')}
                    </p>
                  )}
                  {post.engagements.commented.length > 0 && (
                    <p className="font-body text-ink/60 text-xs mb-1">
                      <span className="text-ink/80">Commented:</span>{' '}
                      {post.engagements.commented.map(e => e.member_name).join(', ')}
                    </p>
                  )}

                  {/* Engagement buttons */}
                  {member && !isOwnPost && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toggleEngagement(post.id, 'liked')}
                        className={`px-4 py-1.5 font-body text-sm border transition-colors ${
                          likedByMe
                            ? 'bg-espresso text-parchment border-espresso'
                            : 'bg-transparent text-espresso border-espresso/40 hover:border-espresso'
                        }`}
                      >
                        {likedByMe ? 'Liked ✓' : 'I Liked'}
                      </button>
                      <button
                        onClick={() => toggleEngagement(post.id, 'commented')}
                        className={`px-4 py-1.5 font-body text-sm border transition-colors ${
                          commentedByMe
                            ? 'bg-espresso text-parchment border-espresso'
                            : 'bg-transparent text-espresso border-espresso/40 hover:border-espresso'
                        }`}
                      >
                        {commentedByMe ? 'Commented ✓' : 'I Commented'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Feed;
