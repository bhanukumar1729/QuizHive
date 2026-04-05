import { useQuizTimer } from '../hooks/useQuizTimer';
import { Clock } from 'lucide-react';

export default function Timer({ deadline, onExpire }) {
  const { formattedTime, isWarning, isExpired } = useQuizTimer(deadline, onExpire);

  const bg      = isExpired ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4';
  const color   = isExpired ? '#DC2626' : isWarning ? '#D97706' : '#16A34A';
  const border  = isExpired ? '#FECACA' : isWarning ? '#FDE68A' : '#BBF7D0';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 14px', borderRadius: '8px',
      background: bg, border: `1px solid ${border}`, color,
      fontWeight: 700, fontSize: '18px', fontVariantNumeric: 'tabular-nums',
      transition: 'all 0.3s',
    }}>
      <Clock size={16} />
      {isExpired ? 'Time up!' : formattedTime}
    </div>
  );
}
