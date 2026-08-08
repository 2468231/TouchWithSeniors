import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, ExternalLink, Download, FileText, Link, X, Eye, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { resourcesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CLUSTERS = {
  CS: {
    label: 'CS Cluster',
    categories: ['DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOPS', 'System Design', 'Aptitude']
  },
  EC: {
    label: 'EC Cluster',
    categories: ['Digital Electronics', 'VLSI', 'Embedded Systems', 'Signals & Systems', 'Microprocessors']
  },
  AIML: {
    label: 'AI/ML Cluster',
    categories: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'Computer Vision']
  }
};

const CLUSTER_COLORS = {
  CS: { badge: 'badge-blue', border: '#1d4ed8' },
  EC: { badge: 'badge-orange', border: '#d97706' },
  AIML: { badge: 'badge-green', border: '#16a34a' }
};

function ResourceCard({ resource }) {
  const [previewing, setPreviewing] = useState(false);
  const isPDF = resource.fileType === 'pdf';

  return (
    <div className="resource-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span className={`badge ${CLUSTER_COLORS[resource.cluster]?.badge || 'badge-blue'}`}>
            {resource.cluster}
          </span>
          <span className="badge badge-gray">{resource.category}</span>
          {isPDF ? (
            <span className="badge badge-orange" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FileText size={10} /> PDF
            </span>
          ) : (
            <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link size={10} /> Link
            </span>
          )}
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a202c', lineHeight: 1.4 }}>
        {resource.title}
      </div>

      {resource.description && (
        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
          {resource.description}
        </p>
      )}

      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        Added by {resource.addedBy?.name}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {isPDF ? (
          <>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPreviewing(v => !v)}
            >
              <Eye size={13} /> {previewing ? 'Hide' : 'Preview PDF'}
            </button>
            <a
              href={resource.link}
              download={resource.fileName || 'resource.pdf'}
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <Download size={13} /> Download
            </a>
          </>
        ) : (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={13} /> Open Link
          </a>
        )}
      </div>

      {/* PDF Preview */}
      {previewing && isPDF && (
        <div style={{ marginTop: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe
            src={resource.link}
            style={{ width: '100%', height: '400px', border: 'none' }}
            title={resource.title}
          />
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCluster, setActiveCluster] = useState('CS');
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [step, setStep] = useState(1); // 1=cluster, 2=details
  const [form, setForm] = useState({ cluster: '', category: '', title: '', description: '', link: '', fileType: 'link' });
  const [pdfFile, setPdfFile] = useState(null);
  const fileRef = useRef();

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resourcesAPI.getAll({
        cluster: activeCluster,
        category: activeCategory || undefined,
        search: search || undefined
      });
      setResources(res.data.resources || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [activeCluster, activeCategory, search]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('PDF must be under 10MB'); return; }
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to submit'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (form.fileType === 'link' && !form.link.trim()) { toast.error('Link is required'); return; }
    if (form.fileType === 'pdf' && !pdfFile) { toast.error('Please select a PDF file'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('cluster', form.cluster);
      formData.append('category', form.category);
      if (form.fileType === 'pdf' && pdfFile) {
        formData.append('pdf', pdfFile);
      } else {
        formData.append('link', form.link);
      }

      await resourcesAPI.create(formData);
      setForm({ cluster: '', category: '', title: '', description: '', link: '', fileType: 'link' });
      setPdfFile(null);
      setShowForm(false);
      setStep(1);
      toast.success('Resource submitted for admin review! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = resources.reduce((acc, r) => {
    const key = r.category || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-title">Free Resources 📚</div>
        <div className="page-subtitle">Curated resources shared by seniors and students</div>
      </div>

      <div className="page-content">
        {/* QUOTE BANNER */}
        <div className="quote-banner" style={{ marginBottom: '1.25rem' }}>
          👋 <strong>Hi, {user?.name?.split(' ')[0] || 'Friend'}!</strong> If you find a genuinely free and useful resource, please add it here to help your juniors. Every link counts! 🙏
        </div>

        {/* Add Resource Button */}
        {user && (
          <button
            className="btn btn-primary"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => { setShowForm(v => !v); setStep(1); }}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Free Resource</>}
          </button>
        )}

        {/* STEP FORM */}
        {showForm && (
          <div className="form-section" style={{ marginBottom: '1.25rem' }}>
            {step === 1 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1a202c' }}>
                  Step 1: Select Cluster
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {Object.entries(CLUSTERS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => { setForm(f => ({ ...f, cluster: k, category: '' })); setStep(2); }}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '8px',
                        border: `2px solid ${form.cluster === k ? CLUSTER_COLORS[k].border : '#e2e8f0'}`,
                        background: form.cluster === k ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: form.cluster === k ? CLUSTER_COLORS[k].border : '#374151',
                        transition: 'all 0.15s'
                      }}
                    >
                      {k === 'CS' && '💻'} {k === 'EC' && '⚡'} {k === 'AIML' && '🤖'} {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <span className={`badge ${CLUSTER_COLORS[form.cluster]?.badge}`}>{form.cluster} Cluster</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" style={{ color: '#1a202c', background: 'white' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                      <option value="" style={{ color: '#1a202c' }}>Select category</option>
                      {CLUSTERS[form.cluster]?.categories.map(c => <option key={c} value={c} style={{ color: '#1a202c' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Resource Type</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                      {['link', 'pdf'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, fileType: type }))}
                          style={{
                            flex: 1, padding: '0.55rem',
                            border: `1px solid ${form.fileType === type ? '#1d4ed8' : '#d1d5db'}`,
                            background: form.fileType === type ? '#eff6ff' : 'white',
                            color: form.fileType === type ? '#1d4ed8' : '#374151',
                            borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 500, fontSize: '0.82rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                          }}
                        >
                          {type === 'link' ? <><Link size={13} /> Link</> : <><FileText size={13} /> PDF</>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="label">Title / Name</label>
                  <input className="input" placeholder="e.g. DBMS Interview Questions by GfG" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>

                {form.fileType === 'link' ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="label">URL / Link</label>
                    <input className="input" type="url" placeholder="https://..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} required />
                  </div>
                ) : (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="label">Upload PDF (max 10MB)</label>
                    <div
                      className="upload-area"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={22} color="#94a3b8" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                      {pdfFile ? (
                        <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem' }}>
                          ✅ {pdfFile.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          Click to upload PDF
                        </span>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Description (optional)</label>
                  <textarea className="input" placeholder="Briefly describe what this resource covers..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '70px' }} />
                </div>

                <div className="alert alert-info">
                  ℹ️ Your resource will be reviewed by the admin before appearing to everyone.
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Resource'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Cluster Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          {Object.entries(CLUSTERS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { setActiveCluster(k); setActiveCategory(''); }}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: `1px solid ${activeCluster === k ? CLUSTER_COLORS[k].border : '#e2e8f0'}`,
                background: activeCluster === k ? '#eff6ff' : 'white',
                color: activeCluster === k ? CLUSTER_COLORS[k].border : '#64748b',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {k === 'CS' && '💻'} {k === 'EC' && '⚡'} {k === 'AIML' && '🤖'} {v.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          <button className={`tag-chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory('')}>All</button>
          {CLUSTERS[activeCluster]?.categories.map(c => (
            <button key={c} className={`tag-chip ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(activeCategory === c ? '' : c)}>{c}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1.25rem' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: '2.2rem' }} placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Resources */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p style={{ marginTop: '0.5rem' }}>No resources yet for this category.</p>
            {user && <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Be the first to add one! 👆</p>}
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category} ({items.length})
              </div>
              <div className="grid-3">
                {items.map(r => <ResourceCard key={r._id} resource={r} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
