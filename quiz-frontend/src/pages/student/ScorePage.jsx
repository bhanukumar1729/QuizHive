import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ScorePage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const result     = state?.result;

  if (!result) {
    navigate('/student', { replace: true });
    return null;
  }

  const pct     = result.percentage?.toFixed(1) ?? 0;
  const passed  = result.percentage >= 50;
  const color   = passed ? '#16A34A' : '#DC2626';
  const bg      = passed ? '#ECFDF5' : '#FEF2F2';
  const Icon    = passed ? CheckCircle : XCircle;

  return (
    <div style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'20px', padding:'48px 40px', maxWidth:'440px', width:'100%', textAlign:'center' }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Icon size={36} color={color} />
        </div>

        <h1 style={{ margin:'0 0 8px', fontSize:'22px', fontWeight:700 }}>
          {passed ? 'Well done!' : 'Better luck next time'}
        </h1>
        <p style={{ margin:'0 0 32px', color:'#6B7280', fontSize:'14px' }}>Quiz submitted successfully</p>

        <div style={{ fontSize:'52px', fontWeight:800, color, marginBottom:'4px' }}>{pct}%</div>
        <p style={{ margin:'0 0 32px', color:'#6B7280', fontSize:'14px' }}>
          {result.score} / {result.totalMarks} marks &nbsp;&middot;&nbsp; {result.correctAnswers} / {result.totalQuestions} correct
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'28px' }}>
          {[
            { label:'Score', value:`${result.score}/${result.totalMarks}` },
            { label:'Percentage', value:`${pct}%` },
            { label:'Correct', value:`${result.correctAnswers}/${result.totalQuestions}` },
            { label:'Status', value: passed ? 'Passed' : 'Failed' },
          ].map(c => (
            <div key={c.label} style={{ background:'#F9FAFB', borderRadius:'10px', padding:'12px' }}>
              <p style={{ margin:'0 0 2px', fontSize:'11px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.label}</p>
              <p style={{ margin:0, fontSize:'16px', fontWeight:700, color:'#111' }}>{c.value}</p>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/student')} style={{
          width:'100%', padding:'12px', background:'#4F46E5', color:'#fff',
          border:'none', borderRadius:'10px', fontWeight:600, fontSize:'14px', cursor:'pointer',
        }}>
          Back to home
        </button>
      </div>
    </div>
  );
}
