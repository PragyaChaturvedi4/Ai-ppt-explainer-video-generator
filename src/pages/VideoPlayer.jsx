import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Download, Share2, Play, Pause,
  Volume2, VolumeX, Maximize2,
  CheckCircle2, Clock, Cpu, Mic, Loader2, Layers
} from 'lucide-react';

const PIPELINE_TAGS = [
  { icon: Cpu,   label: 'FLAN-T5' },
  { icon: Mic,   label: 'Amazon Polly' },
  { icon: Layers, label: 'FFmpeg · EC2' },
];

export default function VideoPlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [playing, setPlaying]   = useState(false);
  const [muted, setMuted]       = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRealVideo = id && id.length > 10;

  useEffect(() => {
    if (isRealVideo) {
      fetch(`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/projects`)
        .then(res => res.json())
        .then(data => {
          const project = data.projects?.find(p => p.id === id);
          if (project) {
            setVideoData(project);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isRealVideo]);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)',
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 500, width: 'fit-content', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'start', maxWidth: 900, margin: '0 auto' }}>

        {/* ── Left: Video + Meta ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Player */}
          <div className="glass" style={{ borderRadius: 18, overflow: 'hidden', padding: 0 }}>
            {/* Video area */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#020810',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              
              {isRealVideo ? (
                <video
                  src={`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/video/${id}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  controls
                  autoPlay
                />
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"
                    alt="Video"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
                  />
                  {/* Big play button */}
                  <button
                    onClick={() => setPlaying(!playing)}
                    style={{ position: 'absolute', width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #38BDF8, #6366F1)',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 32px rgba(56,189,248,0.5)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.boxShadow='0 0 50px rgba(56,189,248,0.7)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 32px rgba(56,189,248,0.5)'; }}
                  >
                    {playing
                      ? <Pause size={28} fill="white" color="white" />
                      : <Play  size={28} fill="white" color="white" style={{ marginLeft: 3 }} />}
                  </button>
                </>
              )}
            </div>

            {/* Controls bar (only show for mocks since real video uses native controls) */}
            {!isRealVideo && (
              <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Scrubber */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    --:--
                  </span>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)',
                    position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '33%', height: '100%', borderRadius: 2,
                      background: 'linear-gradient(90deg, #38BDF8, #6366F1)' }} />
                    <div style={{ position: 'absolute', left: '33%', top: '50%', transform: 'translate(-50%,-50%)',
                      width: 12, height: 12, borderRadius: '50%', background: 'white',
                      boxShadow: '0 0 6px rgba(56,189,248,0.8)' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>--:-- / --:--</span>
                </div>
                {/* Buttons */}
                <button className="btn-icon" onClick={() => setMuted(!muted)}>
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button className="btn-icon"><Maximize2 size={16} /></button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 16 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={16} className="spin" /> Loading video info...
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize: '1.5rem', fontWeight: 700,
                  letterSpacing: '-0.02em', marginBottom: '0.65rem' }}>
                  {videoData?.title || 'Generated Video'}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)',
                  fontSize: '0.8125rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    <CheckCircle2 size={14} color="var(--success)" /> {videoData?.date || 'Recently generated'}
                  </span>
                  <span>·</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    <Clock size={14} /> Video ready
                  </span>
                </div>
              </>
            )}

            {/* Tech tags */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {PIPELINE_TAGS.map(({ icon: Icon, label }) => (
                <span key={label} className="badge badge-blue" style={{ padding: '0.3rem 0.75rem' }}>
                  <Icon size={12} /> {label}
                </span>
              ))}
            </div>

            <div className="divider" />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
                onClick={() => {
                  if (isRealVideo) {
                    window.open(`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/video/${id}`, '_blank');
                  }
                }}
              >
                <Download size={18} /> Download MP4
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.75rem 1.5rem' }}
                onClick={() => {
                  if (navigator.share && isRealVideo) {
                    navigator.share({
                      title: 'CloudPPT Video',
                      url: `http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/video/${id}`
                    });
                  }
                }}
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
