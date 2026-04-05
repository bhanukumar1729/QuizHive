import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { previewExcel } from '../api/excelApi';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExcelDropzone({ onPreviewReady }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await previewExcel(file);
      setPreview(data);
      onPreviewReady?.(data);
      toast.success(`Parsed ${data.validRows} valid questions`);
    } catch (e) {
      toast.error('Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
  }, [onPreviewReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
  });

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? '#4F46E5' : '#D1D5DB'}`,
        borderRadius: '12px', padding: '32px', textAlign: 'center',
        background: isDragActive ? '#EEF2FF' : '#F9FAFB',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <input {...getInputProps()} />
        <Upload size={28} color={isDragActive ? '#4F46E5' : '#9CA3AF'} style={{ margin: '0 auto 8px' }} />
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
          {loading ? 'Parsing...' : isDragActive ? 'Drop it here' : 'Drag & drop .xlsx or click to browse'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
          Columns: Question | Option A | Option B | Option C | Option D | Correct# | Marks
        </p>
      </div>

      {preview && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <span style={{ background: '#ECFDF5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
              ✓ {preview.validRows} valid
            </span>
            {preview.errorRows > 0 && (
              <span style={{ background: '#FEF2F2', color: '#991B1B', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
                ✗ {preview.errorRows} errors
              </span>
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Row', 'Question', 'Options', 'Correct', 'Marks', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.rowNumber}</td>
                    <td style={{ padding: '8px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.questionText}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.options?.length ?? 0} options</td>
                    <td style={{ padding: '8px 12px' }}>
                      {row.correctOptionIndex != null ? String.fromCharCode(65 + row.correctOptionIndex) : '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>{row.marks ?? 1}</td>
                    <td style={{ padding: '8px 12px' }}>
                      {row.status === 'OK'
                        ? <CheckCircle size={14} color="#16A34A" />
                        : <span title={row.errorMessage}><XCircle size={14} color="#DC2626" /></span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
