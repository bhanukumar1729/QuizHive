import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResults } from '../../api/resultApi';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ResultsPage() {
  const { quizId } = useParams();
  const navigate    = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizResults(quizId)
      .then(r => setResults(r.data))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const avg = results.length
    ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight:'100vh', background:'#F9FAFB' }}>
      <Navbar />
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px 24px' }}>
        <button onClick={() => navigate('/faculty')} style={{
          display:'flex', alignItems:'center', gap:'6px',
          background:'none', border:'none', cursor:'pointer',
          color:'#6B7280', fontSize:'14px', padding:'0',
          marginBottom:'16px',
        }}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
        <h1 style={{ margin:'0 0 4px', fontSize:'22px', fontWeight:700 }}>Quiz Results</h1>
        <p style={{ margin:'0 0 24px', color:'#6B7280', fontSize:'14px' }}>
          {results.length} submissions &middot; avg score {avg}%
        </p>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total attempts', value: results.length },
            { label:'Average score', value: `${avg}%` },
            { label:'Pass rate (≥50%)', value: `${results.length ? Math.round(results.filter(r=>r.percentage>=50).length/results.length*100) : 0}%` },
          ].map(c => (
            <div key={c.label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'16px 20px' }}>
              <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#6B7280' }}>{c.label}</p>
              <p style={{ margin:0, fontSize:'22px', fontWeight:700 }}>{c.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign:'center', color:'#6B7280' }}>Loading…</p>
        ) : results.length === 0 ? (
          <p style={{ textAlign:'center', color:'#9CA3AF', marginTop:'60px' }}>No submissions yet.</p>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:'#F9FAFB', borderBottom:'1px solid #E5E7EB' }}>
                  {['#','Name','Email','Score','%','Submitted','Violations'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.attemptId} style={{ borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'10px 14px', color:'#9CA3AF' }}>{i+1}</td>
                    <td style={{ padding:'10px 14px', fontWeight:500 }}>{r.studentName}</td>
                    <td style={{ padding:'10px 14px', color:'#6B7280' }}>{r.studentEmail}</td>
                    <td style={{ padding:'10px 14px' }}>{r.score}/{r.totalMarks}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{
                        padding:'2px 8px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
                        background: r.percentage >= 50 ? '#ECFDF5' : '#FEF2F2',
                        color: r.percentage >= 50 ? '#065F46' : '#991B1B',
                      }}>
                        {r.percentage?.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', color:'#6B7280' }}>
                      {r.submittedAt ? format(new Date(r.submittedAt), 'dd MMM, HH:mm') : '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {r.violationCount > 0 ? (
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', color:'#D97706' }}>
                          <AlertTriangle size={12} /> {r.violationCount}
                        </span>
                      ) : <span style={{ color:'#9CA3AF' }}>0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}