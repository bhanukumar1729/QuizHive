import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuizzes, deleteQuiz, publishQuiz } from '../../api/quizApi';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { Plus, Trash2, Send, BarChart2, Copy } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyQuizzes().then(r => setQuizzes(r.data)).catch(() => toast.error('Failed to load quizzes')).finally(() => setLoading(false));
  }, []);

  const handlePublish = async (id) => {
    try {
      const { data } = await publishQuiz(id);
      setQuizzes(q => q.map(x => x.id === id ? data : x));
      toast.success('Quiz published!');
    } catch (e) { toast.error(e.response?.data?.message || 'Publish failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      setQuizzes(q => q.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const statusBadge = (q) => {
    if (!q.published) return { label: 'Draft', bg: '#F3F4F6', color: '#6B7280' };
    const now = new Date();
    if (now < new Date(q.windowStart)) return { label: 'Scheduled', bg: '#EFF6FF', color: '#1D4ED8' };
    if (now > new Date(q.windowEnd))   return { label: 'Closed',    bg: '#F1F5F9', color: '#475569' };
    return { label: 'Live', bg: '#ECFDF5', color: '#065F46' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>My Quizzes</h1>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>Welcome back, {user?.name}</p>
          </div>
          <button onClick={() => navigate('/faculty/create')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#4F46E5', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px 18px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={16} /> New Quiz
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '60px' }}>Loading…</p>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '16px' }}>No quizzes yet.</p>
            <p style={{ fontSize: '13px' }}>Click "New Quiz" to create one.</p>
          </div>
        ) : quizzes.map((q) => {
          const badge = statusBadge(q);
          return (
            <div key={q.id} style={{
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: '12px', padding: '20px 24px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{q.title}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                    background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Code: <b style={{ color: '#111' }}>{q.code}</b></span>
                  <span>{q.totalQuestions} questions</span>
                  <span>{q.totalAttempts} attempts</span>
                  <span>{q.durationMinutes} min</span>
                  {q.windowStart && <span>Opens: {format(new Date(q.windowStart), 'dd MMM, HH:mm')}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button title="Copy code" onClick={() => copyCode(q.code)} style={iconBtn('#F3F4F6', '#374151')}>
                  <Copy size={14} />
                </button>
                {!q.published && (
                  <button title="Publish" onClick={() => handlePublish(q.id)} style={iconBtn('#EEF2FF', '#4338CA')}>
                    <Send size={14} />
                  </button>
                )}
                <button title="Results" onClick={() => navigate(`/faculty/results/${q.id}`)} style={iconBtn('#F0FDF4', '#15803D')}>
                  <BarChart2 size={14} />
                </button>
                <button title="Delete" onClick={() => handleDelete(q.id)} style={iconBtn('#FEF2F2', '#DC2626')}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const iconBtn = (bg, color) => ({
  background: bg, color, border: 'none', borderRadius: '8px',
  padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
});
