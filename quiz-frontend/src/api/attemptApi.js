import api from './axios';

export const joinQuiz = (data) =>
  api.post('/attempt/join', data);

export const saveAnswer = (data) =>
  api.post('/attempt/answer', data);

export const submitAttempt = (data) =>
  api.post('/attempt/submit', data);

export const logViolation = (data) =>
  api.post('/attempt/violation', data);