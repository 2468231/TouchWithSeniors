import { useState, useEffect, useCallback } from 'react';
import { Plus, ThumbsUp, ThumbsDown, MessageCircle, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { queriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const TAGS = ['Placement', 'AI', 'DSA', 'Internship', 'Resume', 'Interview', 'Academics', 'CGPA', 'Development', 'Communication'];

function formatDate(dateStr) {
  try {
    return format(new Date(dateStr), 'dd-MMM-yyyy');
  } catch {
    return '';
  }
}

// ----- Reply Modal -----
function ReplyModal({ query, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    queriesAPI.getById(query._id).then(res => {
      setComments(res.data.comments || []);
      setLoading(false);
    });
  }, [query._id]);

  const handlePost = async () => {
    if (!text.trim()) return;
    if (!user) { toast.error('Please login to reply'); return; }
    setPosting(true);
    try {
      const res = await queriesAPI.addComment(query._id, { content: text });
      setComments(prev => [res.data.comment, ...prev]);
      setText('');
      toast.success('Reply posted!');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setPosting(false);
    }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a202c', flex: 1, marginRight: '1rem', lineHeight: 1.4 }}>
            {query.title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Author + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem', background: '#1d4ed8' }}>
            {initials(query.author?.name)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {query.author?.name} · {query.author?.college?.split(' ')[0]} · {formatDate(query.createdAt)}
          </span>
        </div>

        {query.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {query.tags.map(t => (
              <span key={t} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>#{t}</span>
            ))}
          </div>
        )}

        <hr className="divider" />

        {/* Reply input */}
        {user ? (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              className="input"
              placeholder="Write your reply..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting || !text.trim()}>
              <Send size={14} /> {posting ? '...' : 'Reply'}
            </button>
          </div>
        ) : (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            Please <a href="/login" style={{ color: '#1d4ed8', fontWeight: 600 }}>login</a> to reply
          </div>
        )}

        {/* Comments */}
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
          {loading ? 'Loading...' : `${comments.length} Repl${comments.length !== 1 ? 'ies' : 'y'}`}
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
          ) : comments.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <MessageCircle size={28} />
              <p style={{ fontSize: '0.85rem' }}>No replies yet. Be the first!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c._id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.65rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem', background: '#1d4ed8', flexShrink: 0 }}>
                  {initials(c.author?.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1a202c' }}>
                    {c.author?.name}
                    <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>{formatDate(c.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, marginTop: '0.2rem' }}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Query Card -----
function QueryCard({ query, onUpvote, onDislike, onReply }) {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const isUpvoted  = userId && query.upvotes?.some(u => (u?._id || u)?.toString() === userId?.toString());
  const isDisliked = userId && query.dislikes?.some(u => (u?._id || u)?.toString() === userId?.toString());
  const initials = query.author?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="query-card">
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.78rem', background: '#1d4ed8', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div
            className="query-title"
            onClick={() => onReply(query)}
          >
            {query.title}
          </div>

          {/* Tags */}
          {query.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {query.tags.map(t => (
                <span key={t} className="badge badge-gray" style={{ fontSize: '0.68rem' }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="query-meta" style={{ marginTop: '0.5rem' }}>
            <span>{query.author?.name} · {query.author?.college?.split(' ')[0]}</span>
            <span>📅 {formatDate(query.createdAt)}</span>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <button
                className={`action-btn ${isUpvoted ? 'upvoted' : ''}`}
                onClick={() => onUpvote(query._id)}
                title="Upvote"
              >
                <ThumbsUp size={13} />
                <span>{query.upvotes?.length || 0}</span>
              </button>
              <button
                className={`action-btn ${isDisliked ? 'downvoted' : ''}`}
                onClick={() => onDislike(query._id)}
                title="Dislike"
              >
                <ThumbsDown size={13} />
                <span>{query.dislikes?.length || 0}</span>
              </button>
              <button
                className="action-btn"
                onClick={() => onReply(query)}
                title="Reply"
              >
                <MessageCircle size={13} />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Main Page -----
export default function AskQueryPage() {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [form, setForm] = useState({ title: '', tags: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queriesAPI.getAll({ tag: selectedTag || undefined, sort: 'newest' });
      setQueries(res.data.queries || []);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const handleUpvote = async (id) => {
    if (!user) { toast.error('Please login to vote'); return; }
    try {
      const res = await queriesAPI.upvote(id);
      setQueries(prev => prev.map(q => {
        if (q._id !== id) return q;
        const uid = user.id || user._id;
        const isUp = q.upvotes?.some(u => (u?._id || u)?.toString() === uid?.toString());
        return {
          ...q,
          upvotes: isUp
            ? q.upvotes.filter(u => (u?._id || u)?.toString() !== uid?.toString())
            : [...(q.upvotes || []), uid],
        };
      }));
    } catch { toast.error('Failed'); }
  };

  const handleDislike = async (id) => {
    if (!user) { toast.error('Please login to vote'); return; }
    try {
      const res = await queriesAPI.dislike(id);
      setQueries(prev => prev.map(q => {
        if (q._id !== id) return q;
        const uid = user.id || user._id;
        const isDis = q.dislikes?.some(u => (u?._id || u)?.toString() === uid?.toString());
        return {
          ...q,
          dislikes: isDis
            ? q.dislikes.filter(u => (u?._id || u)?.toString() !== uid?.toString())
            : [...(q.dislikes || []), uid],
          upvotes: isDis
            ? q.upvotes
            : q.upvotes?.filter(u => (u?._id || u)?.toString() !== uid?.toString()),
        };
      }));
    } catch { toast.error('Failed'); }
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    if (!form.title.trim()) { toast.error('Please enter your question'); return; }
    setSubmitting(true);
    try {
      const res = await queriesAPI.create({ title: form.title, description: form.title, tags: form.tags });
      setQueries(prev => [res.data.query, ...prev]);
      setForm({ title: '', tags: [] });
      setShowForm(false);
      toast.success('Question posted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="page-title">Ask Query 💬</div>
          <div className="page-subtitle">Ask placement doubts — community will answer</div>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Ask Question</>}
          </button>
        )}
      </div>

      <div className="page-content">
        {/* Post form */}
        {showForm && (
          <div className="form-section" style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1a202c' }}>
              Ask Your Question
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="label">Your Question</label>
                <input
                  className="input"
                  placeholder="e.g. How to prepare for Amazon DSA round as a final year student?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Tags (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${form.tags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Question'}
              </button>
            </form>
          </div>
        )}

        {/* Tag filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          <button className={`tag-chip ${!selectedTag ? 'active' : ''}`} onClick={() => setSelectedTag('')}>
            All
          </button>
          {TAGS.map(tag => (
            <button
              key={tag}
              className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Queries list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : queries.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={40} />
            <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          queries.map(q => (
            <QueryCard
              key={q._id}
              query={q}
              onUpvote={handleUpvote}
              onDislike={handleDislike}
              onReply={setSelectedQuery}
            />
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedQuery && (
        <ReplyModal query={selectedQuery} onClose={() => setSelectedQuery(null)} />
      )}
    </div>
  );
}
