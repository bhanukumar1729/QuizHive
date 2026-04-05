import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz, addQuestions } from '../../api/quizApi';
import { confirmExcel } from '../../api/excelApi';
import Navbar from '../../components/Navbar';
import ExcelDropzone from '../../components/ExcelDropzone';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const INPUT = { width:'100%', padding:'10px 14px', fontSize:'14px', border:'1px solid #D1D5DB', borderRadius:'8px', boxSizing:'border-box' };
const LABEL = { display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:600, color:'#374151' };

/**
 * Converts a datetime-local string ("2024-01-15T14:30") to a proper
 * ISO-8601 string with the browser's local timezone offset included
 * ("2024-01-15T14:30:00+05:30"), so the backend Instant deserialiser
 * receives the correct point in time rather than treating it as UTC.
 */
function localToIso(datetimeLocal) {
  if (!datetimeLocal) return '';
  const d = new Date(datetimeLocal);
  const offsetMs  = d.getTimezoneOffset() * 60000;          // offset in ms (negative for IST)
  const local     = new Date(d.getTime() - offsetMs);       // shift to local
  const offsetMin = -d.getTimezoneOffset();                  // +330 for IST
  const sign      = offsetMin >= 0 ? '+' : '-';
  const hh        = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
  const mm        = String(Math.abs(offsetMin) % 60).padStart(2, '0');
  return local.toISOString().slice(0, 19) + sign + hh + ':' + mm;
}

const emptyQuestion = () => ({ text:'', marks:1, options:['','','',''], correctOptionIndex:0 });

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title:'', description:'', windowStart:'', windowEnd:'',
    durationMinutes:30, questionsPerAttempt:10, allowOvertimeSubmission:true,
  });
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'excel'
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [excelPreview, setExcelPreview] = useState(null);

  const setQ = (k) => (e) => setQuizForm(f => ({ ...f, [k]: e.target.value }));

  // ── Manual question helpers ────────────────────────────────────────────────
  const addQuestion = () => setQuestions(q => [...q, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(q => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i, k, v) => setQuestions(q => q.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updateOption = (qi, oi, v) => setQuestions(q => q.map((x, idx) =>
    idx === qi ? { ...x, options: x.options.map((o, oidx) => oidx === oi ? v : o) } : x));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!quizForm.title || !quizForm.windowStart || !quizForm.windowEnd) {
      return toast.error('Fill in title, window start and end');
    }
    setSaving(true);
    try {
      // 1. Create quiz shell
      const payload = {
        ...quizForm,
        durationMinutes: Number(quizForm.durationMinutes),
        questionsPerAttempt: Number(quizForm.questionsPerAttempt),
        // datetime-local gives "2024-01-15T14:30" (local time, no offset).
        // We append the local timezone offset so the backend receives a
        // proper ISO-8601 string with offset e.g. "2024-01-15T14:30:00+05:30"
        // which Jackson deserialises correctly into Instant.
        windowStart: localToIso(quizForm.windowStart),
        windowEnd:   localToIso(quizForm.windowEnd),
      };
      const { data: quiz } = await createQuiz(payload);

      // 2. Add questions
      if (inputMode === 'manual') {
        const validQs = questions.filter(q => q.text.trim() && q.options.filter(Boolean).length >= 2);
        if (validQs.length > 0) await addQuestions(quiz.id, validQs);
      } else if (excelPreview) {
        await confirmExcel(quiz.id, excelPreview);
      }

      toast.success('Quiz created! Publish it from the dashboard.');
      navigate('/faculty');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create quiz');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F9FAFB' }}>
      <Navbar />
      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'32px 24px' }}>
        <h1 style={{ margin:'0 0 24px', fontSize:'22px', fontWeight:700 }}>Create quiz</h1>

        {/* ── Quiz settings ── */}
        <section style={card}>
          <h2 style={sectionTitle}>Quiz settings</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div style={{ gridColumn:'span 2' }}>
              <label style={LABEL}>Title</label>
              <input style={INPUT} placeholder="e.g. Unit 3 — Data Structures" value={quizForm.title} onChange={setQ('title')} />
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={LABEL}>Description (optional)</label>
              <input style={INPUT} placeholder="Brief instructions for students" value={quizForm.description} onChange={setQ('description')} />
            </div>
            <div>
              <label style={LABEL}>Window opens</label>
              <input style={INPUT} type="datetime-local" value={quizForm.windowStart} onChange={setQ('windowStart')} />
            </div>
            <div>
              <label style={LABEL}>Window closes</label>
              <input style={INPUT} type="datetime-local" value={quizForm.windowEnd} onChange={setQ('windowEnd')} />
            </div>
            <div>
              <label style={LABEL}>Duration per student (minutes)</label>
              <input style={INPUT} type="number" min={1} value={quizForm.durationMinutes} onChange={setQ('durationMinutes')} />
            </div>
            <div>
              <label style={LABEL}>Questions per attempt (random)</label>
              <input style={INPUT} type="number" min={1} value={quizForm.questionsPerAttempt} onChange={setQ('questionsPerAttempt')} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <input type="checkbox" id="overtime" checked={quizForm.allowOvertimeSubmission}
                onChange={e => setQuizForm(f => ({ ...f, allowOvertimeSubmission: e.target.checked }))} />
              <label htmlFor="overtime" style={{ fontSize:'13px', color:'#374151' }}>
                Allow students to finish after window closes
              </label>
            </div>
          </div>
        </section>

        {/* ── Question input mode toggle ── */}
        <section style={card}>
          <h2 style={sectionTitle}>Questions</h2>
          <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
            {['manual','excel'].map(m => (
              <button key={m} onClick={() => setInputMode(m)} style={{
                padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer',
                background: inputMode === m ? '#4F46E5' : '#F3F4F6',
                color: inputMode === m ? '#fff' : '#374151',
                border: inputMode === m ? '1px solid #4F46E5' : '1px solid #E5E7EB',
              }}>
                {m === 'manual' ? 'Add manually' : 'Upload Excel'}
              </button>
            ))}
          </div>

          {inputMode === 'manual' ? (
            <>
              {questions.map((q, qi) => (
                <div key={qi} style={{ border:'1px solid #E5E7EB', borderRadius:'10px', padding:'16px', marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#6B7280' }}>Question {qi + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input style={{ ...INPUT, marginBottom:'10px' }} placeholder="Question text"
                    value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <input type="radio" name={`correct-${qi}`} checked={q.correctOptionIndex === oi}
                          onChange={() => updateQuestion(qi, 'correctOptionIndex', oi)} />
                        <input style={{ ...INPUT, flex:1 }} placeholder={`Option ${String.fromCharCode(65+oi)}`}
                          value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <label style={{ ...LABEL, margin:0 }}>Marks:</label>
                    <input style={{ ...INPUT, width:'70px' }} type="number" min={1}
                      value={q.marks} onChange={e => updateQuestion(qi, 'marks', Number(e.target.value))} />
                    <span style={{ fontSize:'12px', color:'#9CA3AF' }}>(select radio = correct answer)</span>
                  </div>
                </div>
              ))}
              <button onClick={addQuestion} style={{
                display:'flex', alignItems:'center', gap:'6px',
                background:'#EEF2FF', color:'#4338CA', border:'1px dashed #C7D2FE',
                borderRadius:'8px', padding:'10px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer', width:'100%', justifyContent:'center',
              }}>
                <Plus size={14} /> Add question
              </button>
            </>
          ) : (
            <ExcelDropzone onPreviewReady={setExcelPreview} />
          )}
        </section>

        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={() => navigate('/faculty')} style={{
            padding:'10px 20px', borderRadius:'8px', fontSize:'14px', fontWeight:600,
            background:'none', border:'1px solid #D1D5DB', cursor:'pointer', color:'#374151',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding:'10px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:600,
            background:'#4F46E5', color:'#fff', border:'none', cursor:'pointer',
          }}>
            {saving ? 'Saving…' : 'Create quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

const card = { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'24px', marginBottom:'16px' };
const sectionTitle = { margin:'0 0 16px', fontSize:'16px', fontWeight:700, color:'#111' };