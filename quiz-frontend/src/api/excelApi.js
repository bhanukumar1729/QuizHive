import api from './axios';

export const previewExcel = (file) => {
  const form = new FormData();
  form.append('file', file);

  return api.post('/excel/preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const confirmExcel = (quizId, preview) =>
  api.post(`/excel/confirm/${quizId}`, preview);