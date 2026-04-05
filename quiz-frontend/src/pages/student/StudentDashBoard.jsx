import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAttempts } from '../../api/resultApi';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyAttempts()
      .then(r => setAttempts(r.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const avg = attempts.length
    ? (attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>My Quizzes</h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>Welcome, {user?.name}</p>
          </div>
          <button onClick={() => navigate('/student/join')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#4F46E5', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px 18px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={16} /> Join Quiz
          </button>
        </div>

        {/* Summary cards — only show if there are attempts */}
        {attempts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Quizzes attempted', value: attempts.length },
              { label: 'Average score',     value: `${avg}%` },
              { label: 'Passed (≥ 50%)',    value: attempts.filter(a => a.percentage >= 50).length },
            ].map(c => (
              <div key={c.label} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '10px', padding: '16px 20px',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B7280' }}>{c.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Attempt list */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '60px' }}>Loading…</p>
        ) : attempts.length === 0 ? (
          <div style={{
            textAlign: 'center', marginTop: '80px',
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: '16px', padding: '48px 24px',
          }}>
            <Clock size={36} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
              No quizzes attempted yet
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#9CA3AF' }}>
              Ask your faculty for a quiz code to get started
            </p>
            <button onClick={() => navigate('/student/join')} style={{
              background: '#4F46E5', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 24px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>
              Join a Quiz
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attempts
              .slice()
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
              .map((attempt) => {
                const passed = attempt.percentage >= 50;
                return (
                  <div key={attempt.attemptId} style={{
                    background: '#fff', border: '1px solid #E5E7EB',
                    borderRadius: '12px', padding: '18px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                  }}>
                    {/* Pass/fail icon */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: passed ? '#ECFDF5' : '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {passed
                        ? <CheckCircle size={20} color="#16A34A" />
                        : <XCircle    size={20} color="#DC2626" />}
                    </div>

                    {/* Quiz info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: '15px' }}>
                        {attempt.quizTitle}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                        Code: <b style={{ color: '#374151' }}>{attempt.quizCode}</b>
                        &nbsp;·&nbsp;
                        {attempt.submittedAt
                          ? format(new Date(attempt.submittedAt), 'dd MMM yyyy, hh:mm a')
                          : '—'}
                      </p>
                    </div>

                    {/* Score badge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        margin: '0 0 2px', fontSize: '20px', fontWeight: 700,
                        color: passed ? '#16A34A' : '#DC2626',
                      }}>
                        {attempt.percentage?.toFixed(1)}%
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                        {attempt.score}/{attempt.totalMarks} marks
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}