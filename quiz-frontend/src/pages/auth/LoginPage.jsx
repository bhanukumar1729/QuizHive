import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const INPUT = {
  width: '100%', padding: '10px 14px', fontSize: '14px',
  border: '1px solid #D1D5DB', borderRadius: '8px',
  outline: 'none', boxSizing: 'border-box',
};
const BTN = {
  width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600,
  background: '#4F46E5', color: '#fff', border: 'none',
  borderRadius: '8px', cursor: 'pointer',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [step, setStep]   = useState('form');   // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [form, setForm]   = useState({ email: '', name: '', role: 'STUDENT' });
  const [otp, setOtp]     = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSend = async () => {
    if (!form.email || !form.name) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await sendOtp(form);
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ email: form.email, otp });
      login({ email: data.email, name: data.name, role: data.role }, data.token);
      toast.success(`Welcome, ${data.name}!`);
      navigate(data.role === 'FACULTY' ? '/faculty' : '/student');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F9FAFB',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '400px', border: '1px solid #E5E7EB',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <BookOpen size={32} color="#4F46E5" style={{ margin: '0 auto 8px' }} />
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111' }}>QuizApp</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
            {step === 'form' ? 'Sign in with your college email' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        {step === 'form' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={INPUT} placeholder="Full name" value={form.name} onChange={set('name')} />
            <input style={INPUT} placeholder="College email" type="email" value={form.email} onChange={set('email')} />
            <select style={INPUT} value={form.role} onChange={set('role')}>
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
            </select>
            <button style={BTN} onClick={handleSend} disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ ...INPUT, letterSpacing: '8px', textAlign: 'center', fontSize: '22px' }}
              placeholder="000000" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
            <button style={BTN} onClick={handleVerify} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button style={{ ...BTN, background: 'none', color: '#4F46E5', border: '1px solid #C7D2FE' }}
              onClick={() => setStep('form')}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
