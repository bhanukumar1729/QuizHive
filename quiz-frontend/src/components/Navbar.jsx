import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '56px',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link to={user?.role === 'FACULTY' ? '/faculty' : '/student'}
        style={{ display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 600, fontSize: '16px', color: '#111', textDecoration: 'none' }}>
        <BookOpen size={20} color="#4F46E5" />
        QuizApp
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {user.name} &middot;
            <span style={{
              marginLeft: '6px', fontSize: '11px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '999px',
              background: user.role === 'FACULTY' ? '#EEF2FF' : '#ECFDF5',
              color: user.role === 'FACULTY' ? '#4338CA' : '#065F46',
            }}>
              {user.role}
            </span>
          </span>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid #e5e7eb',
            borderRadius: '8px', padding: '6px 12px',
            fontSize: '13px', cursor: 'pointer', color: '#374151',
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
