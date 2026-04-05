import api from './axios';

export const createQuiz = (data) => api.post('/quiz', data);

export const addQuestions = (id, data) =>
  api.post(`/quiz/${id}/questions`, data);

export const publishQuiz = (id) =>
  api.patch(`/quiz/${id}/publish`);

export const getMyQuizzes = () =>
  api.get('/quiz');

export const getQuizById = (id) =>
  api.get(`/quiz/${id}`);

export const deleteQuiz = (id) =>
  api.delete(`/quiz/${id}`);