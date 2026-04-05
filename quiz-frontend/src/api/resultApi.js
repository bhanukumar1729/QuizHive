import api from './axios';
export const getQuizResults  = (quizId)   => api.get(`/result/quiz/${quizId}`);
export const getMyResult     = (quizCode) => api.get(`/result/me/${quizCode}`);
export const getMyAttempts   = ()         => api.get('/result/me/history');