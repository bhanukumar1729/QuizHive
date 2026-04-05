import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage      from './pages/auth/LoginPage';
import DashboardPage  from './pages/faculty/DashboardPage';
import CreateQuizPage from './pages/faculty/CreateQuizPage';
import ResultsPage    from './pages/faculty/ResultsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import JoinPage       from './pages/student/JoinPage';
import QuizPage       from './pages/student/QuizPage';
import ScorePage      from './pages/student/ScorePage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'FACULTY' ? '/faculty' : '/student'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/"       element={<RootRedirect />} />
          <Route path="/login"  element={<LoginPage />} />

          {/* Faculty routes */}
          <Route path="/faculty" element={
            <ProtectedRoute role="FACULTY"><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/faculty/create" element={
            <ProtectedRoute role="FACULTY"><CreateQuizPage /></ProtectedRoute>
          } />
          <Route path="/faculty/results/:quizId" element={
            <ProtectedRoute role="FACULTY"><ResultsPage /></ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/join" element={
            <ProtectedRoute role="STUDENT"><JoinPage /></ProtectedRoute>
          } />
          <Route path="/student/quiz" element={
            <ProtectedRoute role="STUDENT"><QuizPage /></ProtectedRoute>
          } />
          <Route path="/student/score" element={
            <ProtectedRoute role="STUDENT"><ScorePage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}