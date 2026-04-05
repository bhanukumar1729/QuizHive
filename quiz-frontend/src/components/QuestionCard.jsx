export default function QuestionCard({ question, index, answer, onAnswer }) {
  // question: { id, text, marks, options:[{shuffledIndex, text}], shuffleMap }
  // answer: chosen shuffledIndex or null
  // onAnswer(questionId, shuffledIndex, shuffleMap)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '12px', padding: '24px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontWeight: 600, fontSize: '15px', color: '#111', margin: 0, flex: 1 }}>
          <span style={{ color: '#6b7280', marginRight: '8px' }}>Q{index + 1}.</span>
          {question.text}
        </p>
        <span style={{
          fontSize: '12px', color: '#6b7280', background: '#F3F4F6',
          borderRadius: '6px', padding: '2px 8px', height: 'fit-content', marginLeft: '12px',
        }}>
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {question.options.map((opt) => {
          const selected = answer === opt.shuffledIndex;
          return (
            <button
              key={opt.shuffledIndex}
              onClick={() => onAnswer(question.id, opt.shuffledIndex, question.shuffleMap)}
              style={{
                textAlign: 'left', padding: '12px 16px',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: selected ? 600 : 400,
                background: selected ? '#EEF2FF' : '#F9FAFB',
                border: selected ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
                color: selected ? '#3730A3' : '#374151',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                display: 'inline-block', width: '22px', height: '22px',
                borderRadius: '50%', textAlign: 'center', lineHeight: '22px',
                fontSize: '11px', fontWeight: 700, marginRight: '10px',
                background: selected ? '#4F46E5' : '#E5E7EB',
                color: selected ? '#fff' : '#6b7280',
              }}>
                {String.fromCharCode(65 + opt.shuffledIndex)}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
