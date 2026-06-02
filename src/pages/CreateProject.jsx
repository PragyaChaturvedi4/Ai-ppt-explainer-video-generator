import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle2, X,
  Mic, Sliders, Play, ChevronRight, User
} from 'lucide-react';

const VOICES = [
  { id: 'Matthew', label: 'Matthew', tag: 'Male · US',     demo: 'Deep & professional' },
  { id: 'Joanna',  label: 'Joanna',  tag: 'Female · US',   demo: 'Clear & friendly'    },
  { id: 'Brian',   label: 'Brian',   tag: 'Male · British', demo: 'Calm & authoritative' },
  { id: 'Amy',     label: 'Amy',     tag: 'Female · British', demo: 'Warm & articulate' },
];

const STYLES = [
  { id: 'Concise',  desc: 'Short, punchy explanations'  },
  { id: 'Detailed', desc: 'In-depth thorough analysis'  },
  { id: 'Academic', desc: 'Formal scholarly language'   },
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [file, setFile]         = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [faceDragging, setFaceDragging] = useState(false);
  const [voice, setVoice]       = useState('Joanna');
  const [style, setStyle]       = useState('Detailed');
  const [useAvatar, setUseAvatar] = useState(true);
  const [step, setStep]         = useState(1); // 1 = upload, 2 = config
  const [isGenerating, setIsGenerating] = useState(false);

  const processFile = (f) => {
    if (f && (f.name.endsWith('.pptx') || f.name.endsWith('.pdf'))) {
      setFile(f);
      if (faceImage) {
        setTimeout(() => setStep(2), 400);
      }
    }
  };

  const processFaceImage = (f) => {
    if (f && (f.name.endsWith('.jpg') || f.name.endsWith('.jpeg') || f.name.endsWith('.png'))) {
      setFaceImage(f);
      if (file) {
        setTimeout(() => setStep(2), 400);
      }
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, [file, faceImage]);

  const onFaceDrop = useCallback((e) => {
    e.preventDefault();
    setFaceDragging(false);
    if (e.dataTransfer.files[0]) processFaceImage(e.dataTransfer.files[0]);
  }, [file, faceImage]);

  const onFileChange = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  const onFaceImageChange = (e) => {
    if (e.target.files[0]) processFaceImage(e.target.files[0]);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setStep(1);
  };

  const removeFaceImage = (e) => {
    e.stopPropagation();
    setFaceImage(null);
    setStep(1);
  };

  const generateVideo = async () => {
    if (!file || !faceImage) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('pptx', file);
      formData.append('face_image', faceImage);
      formData.append('voice', voice);
      formData.append('style', style);
      formData.append('use_avatar', useAvatar.toString());
      const res = await fetch('http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/generate', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('API Upload Failed');
      const data = await res.json();
      navigate(`/processing?taskId=${data.task_id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to EC2 server. Please ensure security groups allow port 8000.');
      setIsGenerating(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize: '2.25rem', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Create <span className="gradient-text">New Video</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Upload your presentation and configure the AI generation settings
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.5rem', marginBottom: '2.5rem' }}>
        {['Upload Files', 'Configure AI', 'Generate'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700,
                background: step > i + 1 ? 'var(--success)' : (step === i + 1 ? 'linear-gradient(135deg,#38BDF8,#6366F1)' : 'rgba(255,255,255,0.07)'),
                color: step >= i + 1 ? '#fff' : 'var(--text-secondary)',
                border: step === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
                {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500,
                color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s}</span>
            </div>
            {i < 2 && <ChevronRight size={16} color="var(--text-muted)" />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: step === 2 ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

        {/* ── Upload Panel (PPTX) - shown in step 1 ── */}
        {step === 1 && (
          <div className="glass-strong" style={{ padding: '2rem', borderRadius: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <UploadCloud size={18} color="var(--accent-blue)" /> UPLOAD PRESENTATION
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && document.getElementById('fileInput').click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent-blue)' : file ? 'var(--success)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center',
                cursor: file ? 'default' : 'pointer',
                background: dragging ? 'rgba(56,189,248,0.04)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease', position: 'relative',
              }}
            >
              <input id="fileInput" type="file" accept=".pptx,.pdf" style={{ display: 'none' }} onChange={onFileChange} />

              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14,
                    background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{file.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{formatSize(file.size)}</div>
                  </div>
                  <span className="badge badge-success"><CheckCircle2 size={12} /> File Ready</span>
                  <button onClick={removeFile} style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '0.35rem', color: 'var(--error)',
                    display: 'flex', cursor: 'pointer',
                  }}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(56,189,248,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="float">
                    <UploadCloud size={32} color="var(--accent-blue)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.0625rem', marginBottom: '0.35rem' }}>
                      Drop your presentation here
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      or <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>browse files</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Supports .pptx · .pdf · Max 50MB
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Face Image Upload Panel - shown in step 1 ── */}
        {step === 1 && (
          <div className="glass-strong" style={{ padding: '2rem', borderRadius: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <User size={18} color="var(--accent-purple)" /> UPLOAD FACE IMAGE
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setFaceDragging(true); }}
              onDragLeave={() => setFaceDragging(false)}
              onDrop={onFaceDrop}
              onClick={() => !faceImage && document.getElementById('faceInput').click()}
              style={{
                border: `2px dashed ${faceDragging ? 'var(--accent-purple)' : faceImage ? 'var(--success)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center',
                cursor: faceImage ? 'default' : 'pointer',
                background: faceDragging ? 'rgba(129,140,248,0.04)' : faceImage ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease', position: 'relative',
              }}
            >
              <input id="faceInput" type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} onChange={onFaceImageChange} />

              {faceImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14,
                    background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={28} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{faceImage.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{formatSize(faceImage.size)}</div>
                  </div>
                  <span className="badge badge-success"><CheckCircle2 size={12} /> Image Ready</span>
                  <button onClick={removeFaceImage} style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '0.35rem', color: 'var(--error)',
                    display: 'flex', cursor: 'pointer',
                  }}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(129,140,248,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="float">
                    <User size={32} color="var(--accent-purple)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.0625rem', marginBottom: '0.35rem' }}>
                      Drop face image here
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      or <span style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>browse files</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Supports .jpg · .jpeg · .png · Max 10MB
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Config Panel (shown only in step 2) ── */}
        {step === 2 && (
          <div className="glass-strong fade-up" style={{ padding: '2rem', borderRadius: 20,
            display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Sliders size={18} color="var(--accent-purple)" /> AI GENERATION SETTINGS
            </h2>

            {/* Voice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mic size={14} /> AMAZON POLLY VOICE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {VOICES.map(v => (
                  <div key={v.id}
                    onClick={() => setVoice(v.id)}
                    style={{
                      padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${voice === v.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'}`,
                      background: voice === v.id ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem',
                      color: voice === v.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{v.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.tag}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                EXPLANATION STYLE
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {STYLES.map(s => (
                  <div key={s.id}
                    onClick={() => setStyle(s.id)}
                    style={{
                      padding: '0.8rem 1rem', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${style === s.id ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)'}`,
                      background: style === s.id ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem',
                        color: style === s.id ? 'var(--accent-purple)' : 'var(--text-primary)' }}>{s.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                    {style === s.id && <CheckCircle2 size={16} color="var(--accent-purple)" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> AVATAR GENERATION
              </label>
              <div
                onClick={() => setUseAvatar(!useAvatar)}
                style={{
                  padding: '0.8rem 1rem', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${useAvatar ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)'}`,
                  background: useAvatar ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem',
                    color: useAvatar ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                    {useAvatar ? 'Avatar Enabled' : 'Avatar Disabled'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {useAvatar ? 'Use Wav2Lip to generate talking face' : 'Generate video without avatar'}
                  </div>
                </div>
                {useAvatar && <CheckCircle2 size={16} color="var(--accent-purple)" />}
              </div>
            </div>

            {/* Generate button */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.0625rem', marginTop: 'auto', opacity: isGenerating ? 0.7 : 1 }}
              onClick={generateVideo}
              disabled={isGenerating}
            >
              <Play size={20} fill="white" /> {isGenerating ? 'Uploading...' : 'Generate Video'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
