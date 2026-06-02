import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Video, Cloud, Cpu, Mic,
  TrendingUp, Play, CheckCircle, FileVideo, Loader2, Trash2
} from 'lucide-react';

const FEATURES = [
  { icon: Cpu,   title: 'FLAN-T5 AI',      desc: 'Transformer-based explanations' },
  { icon: Mic,   title: 'Amazon Polly',     desc: 'Natural voice narration' },
  { icon: Cloud, title: 'AWS EC2',          desc: 'Scalable cloud rendering' },
  { icon: Video, title: 'FFmpeg Engine',    desc: 'HD video compilation' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetch('http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/projects')
      .then(res => res.json())
      .then(data => {
        setServerOnline(true);
        if (data && data.projects) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        setServerOnline(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (taskId) => {
    try {
      const res = await fetch(`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/projects/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== taskId));
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete video');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Hero Banner ── */}
      <section className="glass fade-up" style={{
        padding: '3.5rem 3rem', position: 'relative', overflow: 'hidden', borderRadius: 20,
      }}>
        {/* background blobs */}
        <div style={{ position:'absolute', top:'-60px', left:'-60px', width:320, height:320,
          background:'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', right:'-40px', width:360, height:360,
          background:'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, maxWidth: 680 }}>
          {/* Server status pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
            marginBottom: '1rem',
            background: serverOnline === null
              ? 'rgba(100,116,139,0.15)'
              : serverOnline
                ? 'rgba(16,185,129,0.15)'
                : 'rgba(239,68,68,0.15)',
            color: serverOnline === null
              ? 'var(--text-secondary)'
              : serverOnline
                ? 'var(--success)'
                : 'var(--error)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: serverOnline === null ? '#64748B' : serverOnline ? '#10B981' : '#EF4444',
              display: 'inline-block',
            }} />
            {serverOnline === null ? 'Connecting to EC2…' : serverOnline ? 'EC2 Server Online' : 'EC2 Server Offline'}
          </span>

          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'2.75rem', fontWeight:700,
            lineHeight:1.15, letterSpacing:'-0.03em', marginBottom:'1rem' }}>
            Transform <span className="gradient-text">Slides</span> into<br />Narrated Videos
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'1.0625rem', lineHeight:1.7,
            maxWidth:520, marginBottom:'2rem' }}>
            Upload your PowerPoint and our AI pipeline — powered by FLAN-T5, Amazon Polly&nbsp;&amp;
            FFmpeg on AWS EC2 — delivers a fully narrated video in minutes.
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            <button className="btn btn-primary" style={{ padding:'0.85rem 1.75rem', fontSize:'1rem' }}
              onClick={() => navigate('/create')}>
              <Plus size={20} /> Create New Video
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ position:'absolute', right:'3rem', top:'50%', transform:'translateY(-50%)',
          display:'flex', flexDirection:'column', gap:'0.75rem' }} className="hide-mobile">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass" style={{ padding:'0.75rem 1rem', display:'flex',
              alignItems:'center', gap:'0.75rem', borderRadius:12, minWidth:200 }}>
              <div style={{ width:34, height:34, borderRadius:8, background:'rgba(56,189,248,0.12)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={18} color="var(--accent-blue)" />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.8125rem' }}>{title}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:'0.75rem' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats (derived from real data) ── */}
      {!loading && (
        <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.25rem' }}>
          {[
            {
              label: 'Videos Generated',
              value: projects.length,
              icon: FileVideo,
              color: '#38BDF8',
              bg: 'rgba(56,189,248,0.1)',
            },
            {
              label: 'Server Status',
              value: serverOnline ? 'Online' : 'Offline',
              icon: Cloud,
              color: serverOnline ? '#10B981' : '#EF4444',
              bg: serverOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass fade-up"
              style={{ padding:'1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderRadius:16 }}>
              <div style={{ width:50, height:50, borderRadius:12, background:bg,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={26} color={color} />
              </div>
              <div>
                <div style={{ fontSize:'2rem', fontWeight:700, lineHeight:1 }}>{value}</div>
                <div style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginTop:'0.2rem' }}>{label}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Generated Videos ── */}
      <section>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <h2 style={{ fontSize:'1.375rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-blue)" /> Your Generated Videos
          </h2>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:'1rem', padding:'4rem 0', color:'var(--text-secondary)' }}>
            <Loader2 size={36} className="spin" color="var(--accent-blue)" />
            <span>Connecting to EC2 server…</span>
          </div>
        )}

        {/* Server offline */}
        {!loading && !serverOnline && (
          <div className="glass" style={{ padding:'2.5rem', borderRadius:16, textAlign:'center',
            border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>⚠️</div>
            <div style={{ fontWeight:600, marginBottom:'0.5rem', color:'var(--error)' }}>EC2 Server Unreachable</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:'1.5rem' }}>
              Make sure port 8000 is open in your AWS Security Group and the server is running.
            </div>
          </div>
        )}

        {/* Online but no videos yet */}
        {!loading && serverOnline && projects.length === 0 && (
          <div className="glass" style={{ padding:'3rem', borderRadius:16, textAlign:'center',
            border:'2px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ width:72, height:72, borderRadius:20, margin:'0 auto 1.25rem',
              background:'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(129,140,248,0.15))',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Video size={34} color="var(--accent-blue)" />
            </div>
            <div style={{ fontWeight:700, fontSize:'1.125rem', marginBottom:'0.5rem' }}>No videos yet</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>
              Upload a PowerPoint presentation to generate your first narrated video.
            </div>
            <button className="btn btn-primary" style={{ padding:'0.85rem 1.75rem' }}
              onClick={() => navigate('/create')}>
              <Plus size={18} /> Create Your First Video
            </button>
          </div>
        )}

        {/* Real video cards */}
        {!loading && serverOnline && projects.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.5rem' }}>
            {projects.map((p) => (
              <div key={p.id}
                className="glass"
                style={{
                  padding:'1rem', borderRadius:16, cursor:'pointer',
                  transition:'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                  transform: hoveredCard === p.id ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredCard === p.id ? '0 20px 50px rgba(0,0,0,0.5)' : 'var(--shadow)',
                  borderColor: hoveredCard === p.id ? 'var(--border-active)' : 'rgba(255,255,255,0.07)',
                }}
                onMouseEnter={() => setHoveredCard(p.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/video/${p.id}`)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(p.id);
                  }}
                  style={{
                    position:'absolute', top:12, right:12,
                    width:32, height:32, borderRadius:8,
                    background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)',
                    color:'var(--error)', display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; }}
                >
                  <Trash2 size={16} />
                </button>
                {/* Thumbnail */}
                <div style={{ position:'relative', borderRadius:10, overflow:'hidden',
                  height:170, marginBottom:'0.875rem', background:'#0d1627',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <video
                    src={`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/video/${p.id}#t=0.1`}
                    preload="metadata"
                    style={{ width:'100%', height:'100%', objectFit:'cover',
                      transition:'transform 0.4s', transform: hoveredCard === p.id ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  {/* Play overlay */}
                  {hoveredCard === p.id && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
                      justifyContent:'center', background:'rgba(0,0,0,0.45)' }}>
                      <div style={{ width:52, height:52, borderRadius:'50%',
                        background:'linear-gradient(135deg,#38BDF8,#6366F1)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow:'var(--neon-blue)' }}>
                        <Play size={22} fill="#fff" color="#fff" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 style={{ fontSize:'0.9375rem', fontWeight:600, marginBottom:'0.35rem',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {p.title.replace(/\.(pptx?|pdf)$/i, '')}
                  </h3>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center',
                    color:'var(--text-secondary)', fontSize:'0.8rem' }}>
                    <span>{p.date}</span>
                    <span>·</span>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', color:'var(--success)' }}>
                      <CheckCircle size={12} /> Done
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div className="glass"
              style={{ padding:'1rem', borderRadius:16, cursor:'pointer', minHeight:270,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:'1rem', border:'2px dashed rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.02)', transition:'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-active)'; e.currentTarget.style.background='rgba(56,189,248,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
              onClick={() => navigate('/create')}
            >
              <div style={{ width:54, height:54, borderRadius:14,
                background:'linear-gradient(135deg,rgba(56,189,248,0.15),rgba(129,140,248,0.15))',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Plus size={28} color="var(--accent-blue)" />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:600, marginBottom:'0.25rem' }}>New Project</div>
                <div style={{ color:'var(--text-secondary)', fontSize:'0.8125rem' }}>Upload a .pptx file to start</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
        }}>
          <div className="glass" style={{
            padding:'2rem', borderRadius:16, maxWidth:400, width:'90%',
            textAlign:'center',
          }}>
            <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>🗑️</div>
            <h3 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:'0.5rem' }}>
              Delete Video?
            </h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
              This action cannot be undone. The video will be permanently deleted from the server.
            </p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteConfirm(null)}
                style={{ padding:'0.75rem 1.5rem' }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  padding:'0.75rem 1.5rem',
                  background:'var(--error)', color:'white',
                  border:'none', borderRadius:10, fontWeight:600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
