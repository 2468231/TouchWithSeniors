import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Heart, Mail, X, Upload,
  ShoppingBag, Package, Eye, CheckCircle, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Stationery', 'Lab Equipment', 'Sports', 'Furniture', 'Hostel Essentials', 'Notes/Study Material', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CONDITION_BADGE = { 'New': 'badge-green', 'Like New': 'badge-blue', 'Good': 'badge-cyan', 'Fair': 'badge-orange' };
const CAT_ICON = { Books: '📚', Electronics: '💻', Clothing: '👕', Stationery: '✏️', 'Lab Equipment': '🔬', Sports: '⚽', Furniture: '🪑', 'Hostel Essentials': '🛏️', 'Notes/Study Material': '📝', Other: '📦', All: '🛒' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Product Card ─────────────────────────────────────────
function ProductCard({ product, wishlisted, onWishlist, onContact, onMarkSold, onDelete, isOwner }) {
  const discount = product.originalPrice > product.sellingPrice
    ? Math.round((1 - product.sellingPrice / product.originalPrice) * 100) : 0;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'all 0.25s', cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.32)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.45)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: 185, background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5a6478' }}>
            <span style={{ fontSize: '2.5rem' }}>{CAT_ICON[product.category] || '📦'}</span>
            <span style={{ fontSize: '0.7rem', marginTop: '0.4rem', opacity: 0.6 }}>No photo</span>
          </div>
        )}
        {/* Top badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <span className={`badge ${CONDITION_BADGE[product.condition] || 'badge-gray'}`} style={{ fontSize: '0.63rem' }}>{product.condition}</span>
          {discount > 0 && <span className="badge badge-green" style={{ fontSize: '0.63rem' }}>-{discount}%</span>}
          {product.status === 'Sold' && <span className="badge badge-red" style={{ fontSize: '0.63rem' }}>SOLD</span>}
        </div>
        {/* Wishlist button */}
        <button
          onClick={() => onWishlist(product._id)}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: wishlisted ? 'rgba(236,72,153,0.28)' : 'rgba(0,0,0,0.55)',
            border: `1px solid ${wishlisted ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Heart size={14} fill={wishlisted ? '#ec4899' : 'none'} color={wishlisted ? '#ec4899' : 'white'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
        <div style={{ fontSize: '0.67rem', color: '#8892a4' }}>{CAT_ICON[product.category]} {product.category}</div>

        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e8e8f0', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#a78bfa' }}>₹{product.sellingPrice?.toLocaleString()}</span>
          {discount > 0 && <span style={{ fontSize: '0.72rem', color: '#5a6478', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString()}</span>}
        </div>

        <div style={{ fontSize: '0.7rem', color: '#5a6478' }}>
          👤 {product.seller?.name} · {timeAgo(product.createdAt)}
        </div>
        <div style={{ fontSize: '0.67rem', color: '#8892a4', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          🏫 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.college || product.seller?.college || 'College not specified'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          {product.status === 'Available' && (
            <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.76rem' }}
              onClick={() => onContact(product)}>
              <Mail size={12} /> Contact Seller
            </button>
          )}
          {product.status === 'Sold' && (
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.76rem', color: '#5a6478', padding: '0.35rem' }}>✓ Sold</div>
          )}
          {isOwner && product.status === 'Available' && (
            <button className="btn btn-success btn-sm" title="Mark as Sold" onClick={() => onMarkSold(product._id)}>
              <CheckCircle size={13} />
            </button>
          )}
          {isOwner && (
            <button className="btn btn-danger btn-sm" title="Delete listing" onClick={() => onDelete(product._id)}>
              <Trash2 size={13} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: '#5a6478', marginLeft: 'auto' }}>
            <Eye size={11} /> {product.views}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sell Modal ───────────────────────────────────────────
function SellModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Books', condition: 'Good', originalPrice: '', sellingPrice: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const addFiles = (files) => {
    const arr = Array.from(files).slice(0, 4 - images.length);
    setImages(p => [...p, ...arr]);
    arr.forEach(f => {
      const r = new FileReader();
      r.onload = e => setPreviews(p => [...p, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImages(p => p.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.originalPrice || !form.sellingPrice) {
      toast.error('Please fill all required fields'); return;
    }
    if (parseFloat(form.sellingPrice) > parseFloat(form.originalPrice)) {
      toast.error('Selling price should be ≤ original price');
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(f => fd.append('images', f));
      await productsAPI.create(fd);
      toast.success('🎉 Listing posted!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>📦 Post New Listing</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6478' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Images */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Photos (up to 4)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {previews.map((p, i) => (
                <div key={i} style={{ width: 74, height: 74, borderRadius: 8, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <div className="upload-area" style={{ width: 74, height: 74, padding: '0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 8, flexShrink: 0 }}
                  onClick={() => fileRef.current?.click()}>
                  <Upload size={18} color="#5a6478" />
                  <span style={{ fontSize: '0.58rem', color: '#5a6478', marginTop: '0.2rem' }}>Add photo</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. CLRS Data Structures textbook — 3rd edition"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Condition *</label>
              <select className="input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Original Price (₹) *</label>
              <input className="input" type="number" placeholder="0" min="0"
                value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input className="input" type="number" placeholder="0" min="0"
                value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} required />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Description *</label>
            <textarea className="input" placeholder="Describe your item — condition details, edition, reason for selling..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ minHeight: '85px' }} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Posting...' : <><ShoppingBag size={14} /> Post Listing</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Marketplace Page ────────────────────────────────
export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [page, setPage]               = useState(1);
  const [category, setCategory]       = useState('All');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort]               = useState('newest');
  const [showSell, setShowSell]       = useState(false);
  const [wishlist, setWishlist]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('tws_wishlist') || '[]'); } catch { return []; }
  });
  const [showWishlistPanel, setShowWishlistPanel] = useState(false);
  const sentinelRef = useRef(null); // bottom sentinel for IntersectionObserver
  const PAGE_SIZE = 12;

  // ── Reset & fetch first page whenever filters change ─────
  const fetchFirst = useCallback(async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const res = await productsAPI.getAll({
        ...(category !== 'All' && { category }),
        ...(search && { search }),
        sort,
        page: 1,
        limit: PAGE_SIZE,
      });
      const list = res.data.products || [];
      setProducts(list);
      setHasMore(list.length === PAGE_SIZE);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [category, search, sort]);

  useEffect(() => { fetchFirst(); }, [fetchFirst]);

  // ── Load more (called by IntersectionObserver) ────────────
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await productsAPI.getAll({
        ...(category !== 'All' && { category }),
        ...(search && { search }),
        sort,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      const list = res.data.products || [];
      setProducts(prev => [...prev, ...list]);
      setPage(nextPage);
      setHasMore(list.length === PAGE_SIZE);
    } catch {}
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, page, category, search, sort]);

  // ── IntersectionObserver watches the sentinel div ─────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchMore]);

  // ── Debounce search input ─────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleWishlist = async (id) => {
    const updated = wishlist.includes(id) ? wishlist.filter(w => w !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem('tws_wishlist', JSON.stringify(updated));
    try { await productsAPI.toggleWishlist(id); } catch {}
  };

  const handleContact = (product) => {
    const email = product.seller?.email;
    if (email) {
      window.open(
        `mailto:${email}?subject=Interested in: ${encodeURIComponent(product.title)}&body=Hi ${product.seller?.name},%0A%0AI saw your listing on TouchWithSeniors and I'm interested in: "${product.title}" at ₹${product.sellingPrice}.%0A%0AIs it still available?%0A%0AThank you!`,
        '_blank'
      );
    } else {
      toast.error('Seller contact unavailable');
    }
  };

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this item as Sold?')) return;
    try {
      await productsAPI.update(id, { status: 'Sold' });
      setProducts(p => p.map(x => x._id === id ? { ...x, status: 'Sold' } : x));
      toast.success('Marked as sold!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p._id));
  const userId = user?.id || user?._id;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="page-title">Student Marketplace 🛒</div>
            <div className="page-subtitle">
              Buy & sell within{' '}
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>
                {user?.college?.split(' ').slice(0, 3).join(' ') || 'your college'}
              </span>
              {' '}— verified students only
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowWishlistPanel(v => !v)} style={{ position: 'relative' }}>
              <Heart size={14} fill={wishlist.length ? '#ec4899' : 'none'} color={wishlist.length ? '#ec4899' : 'currentColor'} />
              Wishlist
              {wishlist.length > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, background: '#ec4899', color: 'white', borderRadius: '50%', width: 17, height: 17, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {wishlist.length}
                </span>
              )}
            </button>
            {user && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowSell(true)}>
                <Plus size={14} /> Sell Item
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.78rem', color: '#a78bfa' }}>
            📦 {products.length} listings in your college
          </div>
          {user && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.78rem', color: '#6ee7b7' }}>
              🔒 Data visible only to {user.college?.split(' ').slice(0, 2).join(' ')} students
            </div>
          )}
        </div>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a6478' }} />
            <input className="input" style={{ paddingLeft: '2.2rem' }}
              placeholder="Search books, electronics, clothes..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <select className="input" style={{ width: '175px', flexShrink: 0 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
            <option value="popular">Most Viewed</option>
          </select>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`tag-chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {CAT_ICON[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Wishlist Panel */}
        {showWishlistPanel && (
          <div style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.18)', borderRadius: 14, padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f9a8d4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} fill="#ec4899" color="#ec4899" /> Wishlist ({wishlistedProducts.length})
              </div>
              <button onClick={() => setShowWishlistPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6478' }}><X size={16} /></button>
            </div>
            {wishlistedProducts.length === 0 ? (
              <div style={{ color: '#5a6478', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>No wishlisted items yet</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
                {wishlistedProducts.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: '0.55rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 7, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.3rem' }}>{CAT_ICON[p.category] || '📦'}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.79rem', color: '#e8e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '0.77rem' }}>₹{p.sellingPrice?.toLocaleString()}</div>
                    </div>
                    <button onClick={() => toggleWishlist(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ec4899', flexShrink: 0 }}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🛒</div>
            <p style={{ fontWeight: 700, color: '#8892a4', fontSize: '1rem' }}>No listings found</p>
            <p style={{ fontSize: '0.82rem', color: '#5a6478', marginTop: '0.3rem' }}>
              Be the first to sell something in the marketplace!
            </p>
            {user && (
              <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowSell(true)}>
                <Plus size={14} /> Post First Listing
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: '1rem' }}>
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  wishlisted={wishlist.includes(p._id)}
                  onWishlist={toggleWishlist}
                  onContact={handleContact}
                  onMarkSold={handleMarkSold}
                  onDelete={handleDelete}
                  isOwner={userId && (userId === p.seller?._id || userId === p.seller?.id || userId === (p.seller?._id?.toString()))}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: '1px', marginTop: '1rem' }} />

            {/* Loading more spinner */}
            {loadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                <div className="spinner" />
              </div>
            )}

            {/* End of results */}
            {!hasMore && products.length > 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                — You’ve seen all {products.length} listings —
              </div>
            )}
          </>
        )}
      </div>

      {showSell && (
        <SellModal
          onClose={() => setShowSell(false)}
          onSuccess={() => { setShowSell(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}
