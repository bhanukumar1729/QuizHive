import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAnswer, submitAttempt, logViolation } from '../../api/attemptApi';
import QuestionCard from '../../components/QuestionCard';
import Timer from '../../components/Timer';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export default function QuizPage() {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const data        = state?.attemptData;

  const [answers, setAnswers]       = useState({});   // { questionId: shuffledIndex }
  const [submitLoading, setSubmit]  = useState(false);
  const [violations, setViolations] = useState(0);
  const [warningMsg, setWarningMsg] = useState('');
  const isSubmitting                = useRef(false);

  // Redirect if no attempt data
  useEffect(() => {
    if (!data) navigate('/student', { replace: true });
  }, [data, navigate]);

  // ── Fullscreen on mount ────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen?.(); };
  }, []);

  // ── Anti-cheat: tab visibility ────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !isSubmitting.current) {
        handleViolation('TAB_SWITCH');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [violations]);

  // ── Anti-cheat: fullscreen exit ────────────────────────────────────────────
  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement && !isSubmitting.current) {
        handleViolation('FULLSCREEN_EXIT');
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, [violations]);

  // ── Anti-cheat: copy/paste/right-click ────────────────────────────────────
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);
    document.addEventListener('contextmenu', block);
    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('contextmenu', block);
    };
  }, []);

  const handleViolation = async (type) => {
    const newCount = violations + 1;
    setViolations(newCount);
    setWarningMsg(newCount === 1
      ? 'Warning: Do not switch tabs or exit fullscreen. Next violation will auto-submit.'
      : 'Auto-submitting due to repeated violations…');

    try {
      await logViolation({ attemptId: data.attemptId, violationType: type });
    } catch {}

    if (newCount >= 2) {
      setTimeout(() => handleSubmit(true), 1500);
    }
  };

  // ── Answer ─────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (questionId, shuffledIndex, shuffleMap) => {
    setAnswers(a => ({ ...a, [questionId]: shuffledIndex }));
    try {
      await saveAnswer({ attemptId: data.attemptId, questionId, chosenShuffledIndex: shuffledIndex, shuffleMap });
    } catch {}
  }, [data]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (auto = false) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setSubmit(true);
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      const { data: result } = await submitAttempt({ attemptId: data.attemptId });
      toast.success(auto ? 'Auto-submitted' : 'Submitted!');
      navigate('/student/score', { state: { result, quizCode: data.quizCode } });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submit failed');
      isSubmitting.current = false;
      setSubmit(false);
    }
  };

  if (!data) return null;

  const answered = Object.keys(answers).length;
  const total    = data.questions.length;

  return (
    <div style={{ minHeight:'100vh', background:'#F3F4F6', userSelect:'none' }}>
      {/* Sticky header */}
      <div style={{
        position:'sticky', top:0, zIndex:50,
        background:'#fff', borderBottom:'1px solid #E5E7EB',
        padding:'0 24px', height:'60px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <h2 style={{ margin:0, fontSize:'15px', fontWeight:700 }}>{data.quizTitle}</h2>
          <p style={{ margin:0, fontSize:'12px', color:'#6B7280' }}>{answered}/{total} answered</p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <Timer deadline={data.deadline} onExpire={() => handleSubmit(true)} />
          <button onClick={() => {
            if (confirm(`Submit now? ${total - answered} question(s) unanswered.`)) handleSubmit();
          }} disabled={submitLoading} style={{
            padding:'8px 20px', background:'#4F46E5', color:'#fff',
            border:'none', borderRadius:'8px', fontWeight:600, fontSize:'13px', cursor:'pointer',
          }}>
            {submitLoading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Violation warning banner */}
      {warningMsg && (
        <div style={{
          background:'#FFFBEB', borderBottom:'1px solid #FDE68A',
          padding:'10px 24px', display:'flex', alignItems:'center', gap:'8px',
          color:'#92400E', fontSize:'13px', fontWeight:500,
        }}>
          <AlertTriangle size={16} /> {warningMsg}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height:'3px', background:'#E5E7EB' }}>
        <div style={{ height:'100%', background:'#4F46E5', width:`${(answered/total)*100}%`, transition:'width 0.3s' }} />
      </div>

      {/* Questions */}
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'24px' }}>
        {data.questions.map((q, i) => (
          <QuestionCard
            key={q.id} question={q} index={i}
            answer={answers[q.id] ?? null}
            onAnswer={handleAnswer}
          />
        ))}

        <div style={{ textAlign:'right', marginTop:'8px' }}>
          <button onClick={() => {
            if (confirm(`Submit now? ${total - answered} question(s) unanswered.`)) handleSubmit();
          }} disabled={submitLoading} style={{
            padding:'12px 32px', background:'#4F46E5', color:'#fff',
            border:'none', borderRadius:'10px', fontWeight:700, fontSize:'15px', cursor:'pointer',
          }}>
            {submitLoading ? 'Submitting…' : 'Submit quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
