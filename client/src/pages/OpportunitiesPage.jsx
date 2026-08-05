import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Calendar, MapPin, DollarSign, Filter, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { opportunitiesAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

const TYPE_COLORS = { internship: 'badge-purple', fulltime: 'badge-green', remote: 'badge-cyan' };
const TYPE_LABELS = { internship: 'Internship', fulltime: 'Full Time', remote: 'Remote' };
const TAG_COLORS = { Product: 'badge-cyan', Startup: 'badge-orange', Service: 'badge-purple', MNC: 'badge-green', Remote: 'badge-pink' };

function OppCard({ opp, isBookmarked, onBookmark }) {
  const deadline = opp.deadline ? new Date(opp.deadline) : null;
  const isExpired = deadline && deadline < new Date();

  return (
    <motion.div
      className="opp-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${TYPE_COLORS[opp.type] || 'badge-purple'}`}>{TYPE_LABELS[opp.type] || opp.type}</span>
          {opp.tags?.map(t => <span key={t} className={`badge ${TAG_COLORS[t] || 'badge-purple'}`} style={{ fontSize: '0.7rem' }}>{t}</span>)}
        </div>
        <button
          onClick={() => onBookmark(opp._id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? '#f59e0b' : 'var(--color-text-muted)', transition: 'color 0.2s' }}
        >
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{opp.role}</h3>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.75rem' }}>{opp.company}</p>

      {opp.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {opp.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          <MapPin size={12} /> {opp.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          <DollarSign size={12} /> {opp.salary}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: isExpired ? '#ef4444' : '#f59e0b' }}>
          <Calendar size={12} />
          {isExpired ? 'Expired' : `Deadline: ${deadline ? format(deadline, 'dd MMM yyyy') : 'N/A'}`}
        </div>
      </div>

      <a
        href={opp.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        style={{ textDecoration: 'none', justifyContent: 'center', display: 'flex', fontSize: '0.85rem', padding: '0.55rem' }}
      >
        Apply Now <ExternalLink size={14} />
      </a>
    </motion.div>
  );
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await opportunitiesAPI.getAll({ search: search || undefined, type: typeFilter || undefined, tag: tagFilter || undefined });
      setOpportunities(res.data.opportunities || []);
      setBookmarks(res.data.bookmarks || []);
    } catch {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, tagFilter]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const handleBookmark = async (id) => {
    if (!user) { toast.error('Please login to bookmark'); return; }
    try {
      const res = await usersAPI.bookmark(id);
      setBookmarks(res.data.bookmarks.map(b => b.toString()));
      toast.success(res.data.bookmarked ? 'Bookmarked! ✅' : 'Removed bookmark');
    } catch { toast.error('Failed to bookmark'); }
  };

  const displayed = showBookmarks ? opportunities.filter(o => bookmarks.includes(o._id)) : opportunities;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Off Campus Opportunities 💼</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {opportunities.length} active opportunities · Updated daily
            </p>
          </div>
          {user && (
            <button
              className={showBookmarks ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setShowBookmarks(v => !v)}
            >
              <Bookmark size={16} /> {showBookmarks ? 'All Jobs' : `Saved (${bookmarks.length})`}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input" style={{ paddingLeft: '2.5rem' }} placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto', minWidth: 150 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="internship">Internship</option>
            <option value="fulltime">Full Time</option>
            <option value="remote">Remote</option>
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 150 }} value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
            <option value="">All Tags</option>
            <option value="Product">Product</option>
            <option value="Startup">Startup</option>
            <option value="MNC">MNC</option>
            <option value="Service">Service</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Quick filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['internship', 'fulltime', 'remote'].map(t => (
            <button key={t} className={`tag-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(typeFilter === t ? '' : t)}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3 style={{ marginTop: '1rem', color: 'white' }}>{showBookmarks ? 'No saved jobs' : 'No opportunities found'}</h3>
            <p>{showBookmarks ? 'Bookmark jobs to save them here' : 'Check back soon for new opportunities'}</p>
          </div>
        ) : (
          <div className="grid-3">
            {displayed.map(opp => (
              <OppCard key={opp._id} opp={opp} isBookmarked={bookmarks.includes(opp._id)} onBookmark={handleBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
