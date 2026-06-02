import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Cpu, Mic, Image, Video, PackageCheck,
  CheckCircle2, Loader2, Cloud, AlertCircle
} from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: FileText,
    title: 'Text Extraction',
    subtitle: 'python-pptx',
    desc: 'Reading and parsing slide content from your PowerPoint file…',
    doneMsg: 'Slide content successfully extracted',
  },
  {
    id: 2,
    icon: Cpu,
    title: 'AI Explanation Generation',
    subtitle: 'FLAN-T5 Transformer',
    desc: 'Generating detailed explanations via the FLAN-T5 language model on AWS EC2…',
    doneMsg: 'Narration scripts generated',
  },
  {
    id: 3,
    icon: Mic,
    title: 'Text-to-Speech Conversion',
    subtitle: 'Amazon Polly',
    desc: 'Synthesising natural-sounding voice narration with Amazon Polly…',
    doneMsg: 'Audio generated',
  },
  {
    id: 4,
    icon: Image,
    title: 'Visual Synchronisation',
    subtitle: 'PIL · FFmpeg',
    desc: 'Generating slide images and aligning visuals with narration timestamps…',
    doneMsg: 'Slide images rendered',
  },
  {
    id: 5,
    icon: Video,
    title: 'Video Rendering',
    subtitle: 'FFmpeg on EC2',
    desc: 'Merging audio tracks with slide visuals into an HD MP4 video on AWS EC2…',
    doneMsg: 'Video encoded',
  },
  {
    id: 6,
    icon: PackageCheck,
    title: 'Finalisation',
    subtitle: 'AWS EC2',
    desc: 'Saving the final video and cleaning up temp files…',
    doneMsg: 'Saved to cloud · Ready to view',
  },
];

export default function PipelineStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const taskId = new URLSearchParams(location.search).get('taskId');

  const [currentStep, setCurrentStep] = useState(0); // index (0-based)
  const [done, setDone]               = useState(false);
  const [status, setStatus]           = useState('starting');

  // Real backend polling
  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://ec2-51-20-117-218.eu-north-1.compute.amazonaws.com:8000/api/status/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.status === 'completed') {
            setCurrentStep(STEPS.length);
            setDone(true);
            clearInterval(interval);
            setTimeout(() => navigate(`/video/${taskId}`), 1800);
          } else if (data.status === 'failed') {
            alert('Pipeline failed on the AWS EC2 server!');
            clearInterval(interval);
            navigate('/');
          } else if (data.status === 'processing') {
            // Show processing state without fake steps
            setCurrentStep(1);
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [taskId, navigate]);

  const elapsedPercent = done ? 100 : (currentStep / STEPS.length) * 100;

  return (
    <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="glass-strong" style={{ padding: '2.75rem 3rem', borderRadius: 22 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))',
            border: '1px solid rgba(56,189,248,0.25)', marginBottom: '1.25rem' }}
            className={done ? '' : 'float'}>
            <Cloud size={30} color="var(--accent-blue)" />
          </div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize: '1.75rem', fontWeight: 700,
            letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            {done ? '🎉 Video Ready!' : <>Processing <span className="gradient-text">Your Presentation</span></>}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {done ? 'Redirecting to your video player…' : 'Please wait while our cloud pipeline generates your video'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem',
            fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <span>Overall Progress</span>
            <span style={{ color: done ? 'var(--success)' : 'var(--accent-blue)', fontWeight: 600 }}>
              {elapsedPercent}%
            </span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${elapsedPercent}%` }} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {STEPS.map((step, idx) => {
            const Icon       = step.icon;
            const isActive   = idx === currentStep && !done;
            const isComplete = idx < currentStep || done;
            const isPending  = idx > currentStep && !done;

            return (
              <div key={step.id} style={{ display: 'flex', gap: '1.25rem', position: 'relative',
                paddingBottom: idx < STEPS.length - 1 ? '1.75rem' : '0',
                opacity: isPending ? 0.35 : 1, transition: 'opacity 0.4s ease',
              }}>
                {/* Vertical connector line */}
                {idx < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 21, top: 48,
                    width: 2, height: 'calc(100% - 30px)',
                    background: isComplete
                      ? 'linear-gradient(180deg, var(--success) 0%, rgba(16,185,129,0.3) 100%)'
                      : 'rgba(255,255,255,0.07)',
                    borderRadius: 2, transition: 'background 0.5s',
                  }} />
                )}

                {/* Icon circle */}
                <div style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: '50%', zIndex: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isComplete
                    ? 'rgba(16,185,129,0.18)'
                    : isActive
                      ? 'rgba(56,189,248,0.14)'
                      : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${
                    isComplete ? 'var(--success)' : isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'
                  }`,
                  boxShadow: isActive ? 'var(--neon-blue)' : 'none',
                  transition: 'all 0.4s ease',
                  animation: isActive ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                }}>
                  {isComplete
                    ? <CheckCircle2 size={20} color="var(--success)" />
                    : isActive
                      ? <Loader2 size={20} color="var(--accent-blue)" className="spin" />
                      : <Icon size={20} color="rgba(255,255,255,0.25)" />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem',
                      color: isActive ? 'var(--accent-blue)' : isComplete ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.45rem', borderRadius: 4 }}>
                      {step.subtitle}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                    transition: 'color 0.3s' }}>
                    {isComplete ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> {step.doneMsg}
                      </span>
                    ) : isActive ? (
                      step.desc
                    ) : 'Waiting…'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cloud info footer */}
        {!done && (
          <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', borderRadius: 12,
            background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem',
            color: 'var(--text-secondary)' }}>
            <AlertCircle size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
            Processing is running on <strong style={{ color: 'var(--accent-blue)' }}>AWS EC2</strong>.
            Do not close this window.
          </div>
        )}
      </div>

      {/* keyframes injected */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(56,189,248,0.4); }
          50%       { box-shadow: 0 0 22px rgba(56,189,248,0.75); }
        }
      `}} />
    </div>
  );
}
