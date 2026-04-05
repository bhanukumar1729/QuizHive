package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.response.ResultDTO;
import com.quizapp.quizBackend.entity.Quiz;
import com.quizapp.quizBackend.entity.StudentAttempt;
import com.quizapp.quizBackend.exception.QuizNotFoundException;
import com.quizapp.quizBackend.repository.QuizRepository;
import com.quizapp.quizBackend.repository.StudentAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final QuizRepository quizRepository;
    private final StudentAttemptRepository attemptRepository;

    /** Faculty: get all results for a quiz, sorted by score desc */
    public List<ResultDTO> getResultsForQuiz(Long quizId, String facultyEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        if (!quiz.getCreatedBy().getEmail().equals(facultyEmail)) {
            throw new SecurityException("Access denied");
        }

        return attemptRepository.findByQuizOrderByScoreDesc(quiz)
                .stream()
                .filter(StudentAttempt::getSubmitted)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Student: get all their own submitted attempts across all quizzes */
    public List<ResultDTO> getMyAttempts(String studentEmail) {
        return attemptRepository.findByStudentEmail(studentEmail)
                .stream()
                .filter(StudentAttempt::getSubmitted)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Student: get their own result for a specific quiz */
    public ResultDTO getMyResult(String quizCode, String studentEmail) {
        Quiz quiz = quizRepository.findByCode(quizCode)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        StudentAttempt attempt = attemptRepository
                .findByQuizAndStudentEmail(quiz, studentEmail)
                .orElseThrow(() -> new RuntimeException("No attempt found"));

        if (!attempt.getSubmitted()) {
            throw new RuntimeException("Attempt not yet submitted");
        }

        return toDTO(attempt);
    }

    private ResultDTO toDTO(StudentAttempt attempt) {
        ResultDTO dto = new ResultDTO();
        dto.setAttemptId(attempt.getId());
        dto.setStudentEmail(attempt.getStudentEmail());
        dto.setStudentName(attempt.getStudentName());
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setQuizCode(attempt.getQuiz().getCode());
        dto.setScore(attempt.getScore());
        dto.setTotalMarks(attempt.getTotalMarks());
        dto.setPercentage(attempt.getTotalMarks() != null && attempt.getTotalMarks() > 0
                ? (attempt.getScore() * 100.0 / attempt.getTotalMarks()) : 0.0);
        dto.setJoinedAt(attempt.getJoinedAt());
        dto.setSubmittedAt(attempt.getSubmittedAt());
        dto.setViolationCount(attempt.getViolationCount());
        return dto;
    }
}