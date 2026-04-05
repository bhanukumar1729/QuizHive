import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinQuiz } from '../../api/attemptApi';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Hash } from 'lucide-react';

export default function JoinPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [code, setCode]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 4) return toast.error('Enter a valid quiz code');
    setLoading(true);
    try {
      const { data } = await joinQuiz({ quizCode: code.trim().toUpperCase() });
      toast.success('Joined! Entering quiz…');
      navigate('/student/quiz', { state: { attemptData: data } });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to join quiz');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F9FAFB' }}>
      <Navbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 56px)' }}>
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'400px', textAlign:'center' }}>
          <Hash size={32} color="#4F46E5" style={{ margin:'0 auto 12px' }} />
          <h1 style={{ margin:'0 0 8px', fontSize:'20px', fontWeight:700 }}>Join a Quiz</h1>
          <p style={{ margin:'0 0 24px', color:'#6B7280', fontSize:'14px' }}>
            Hi {user?.name}, enter the code your faculty shared
          </p>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="e.g. AB3K7X2P"
            maxLength={8}
            style={{
              width:'100%', padding:'12px 16px', fontSize:'20px', letterSpacing:'6px',
              textAlign:'center', fontWeight:700, border:'1px solid #D1D5DB',
              borderRadius:'10px', boxSizing:'border-box', marginBottom:'16px',
            }}
          />
          <button onClick={handleJoin} disabled={loading} style={{
            width:'100%', padding:'12px', fontSize:'15px', fontWeight:600,
            background:'#4F46E5', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer',
          }}>
            {loading ? 'Joining…' : 'Join Quiz'}
          </button>
          <button onClick={() => navigate('/student')} style={{
            width:'100%', padding:'10px', fontSize:'13px', fontWeight:500,
            background:'none', border:'1px solid #E5E7EB', borderRadius:'10px',
            cursor:'pointer', color:'#6B7280', marginTop:'8px',
          }}>
            Back to my quizzes
          </button>
          <p style={{ margin:'16px 0 0', fontSize:'12px', color:'#9CA3AF' }}>
            You only get one attempt. Make sure you are ready before joining.
          </p>
        </div>
      </div>
    </div>
  );
}