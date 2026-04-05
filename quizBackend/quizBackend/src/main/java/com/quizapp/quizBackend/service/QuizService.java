package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.request.QuestionRequest;
import com.quizapp.quizBackend.dto.request.QuizCreateRequest;
import com.quizapp.quizBackend.dto.response.QuizSummaryDTO;
import com.quizapp.quizBackend.entity.*;
import com.quizapp.quizBackend.exception.QuizNotFoundException;
import com.quizapp.quizBackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final StudentAttemptRepository attemptRepository;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public QuizSummaryDTO createQuiz(String facultyEmail, QuizCreateRequest req) {
        User faculty = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Quiz quiz = Quiz.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .code(generateUniqueCode())
                .createdBy(faculty)
                .windowStart(req.getWindowStart())
                .windowEnd(req.getWindowEnd())
                .durationMinutes(req.getDurationMinutes())
                .questionsPerAttempt(req.getQuestionsPerAttempt())
                .allowOvertimeSubmission(req.getAllowOvertimeSubmission())
                .published(false)
                .build();

        quizRepository.save(quiz);

        if (req.getQuestions() != null) {
            addQuestionsToQuiz(quiz, req.getQuestions());
        }

        return toSummaryDTO(quiz);
    }

    @Transactional
    public QuizSummaryDTO addQuestions(Long quizId, String facultyEmail, List<QuestionRequest> questionReqs) {
        Quiz quiz = getQuizOwnedBy(quizId, facultyEmail);
        addQuestionsToQuiz(quiz, questionReqs);
        return toSummaryDTO(quiz);
    }

    @Transactional
    public QuizSummaryDTO publishQuiz(Long quizId, String facultyEmail) {
        Quiz quiz = getQuizOwnedBy(quizId, facultyEmail);

        long questionCount = questionRepository.countByQuiz(quiz);
        if (questionCount < quiz.getQuestionsPerAttempt()) {
            throw new IllegalStateException(
                "Not enough questions. Need at least " + quiz.getQuestionsPerAttempt()
                + " but only have " + questionCount);
        }

        quiz.setPublished(true);
        quizRepository.save(quiz);
        return toSummaryDTO(quiz);
    }

    public List<QuizSummaryDTO> getMyQuizzes(String facultyEmail) {
        User faculty = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return quizRepository.findByCreatedByOrderByCreatedAtDesc(faculty)
                .stream().map(this::toSummaryDTO).collect(Collectors.toList());
    }

    public QuizSummaryDTO getQuizById(Long quizId, String facultyEmail) {
        return toSummaryDTO(getQuizOwnedBy(quizId, facultyEmail));
    }

    @Transactional
    public void deleteQuiz(Long quizId, String facultyEmail) {
        Quiz quiz = getQuizOwnedBy(quizId, facultyEmail);
        quizRepository.delete(quiz);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void addQuestionsToQuiz(Quiz quiz, List<QuestionRequest> questionReqs) {
        for (QuestionRequest qr : questionReqs) {
            Question question = Question.builder()
                    .text(qr.getText())
                    .quiz(quiz)
                    .correctOptionIndex(qr.getCorrectOptionIndex())
                    .marks(qr.getMarks() != null ? qr.getMarks() : 1)
                    .options(new ArrayList<>())
                    .build();

            for (String optText : qr.getOptions()) {
                Option opt = Option.builder()
                        .text(optText)
                        .question(question)
                        .build();
                question.getOptions().add(opt);
            }

            questionRepository.save(question);
        }
    }

    private Quiz getQuizOwnedBy(Long quizId, String email) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));
        if (!quiz.getCreatedBy().getEmail().equals(email)) {
            throw new SecurityException("Access denied");
        }
        return quiz;
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = random.ints(8, 0, CODE_CHARS.length())
                    .mapToObj(i -> String.valueOf(CODE_CHARS.charAt(i)))
                    .collect(Collectors.joining());
        } while (quizRepository.findByCode(code).isPresent());
        return code;
    }

    public QuizSummaryDTO toSummaryDTO(Quiz quiz) {
        QuizSummaryDTO dto = new QuizSummaryDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setCode(quiz.getCode());
        dto.setWindowStart(quiz.getWindowStart());
        dto.setWindowEnd(quiz.getWindowEnd());
        dto.setDurationMinutes(quiz.getDurationMinutes());
        dto.setQuestionsPerAttempt(quiz.getQuestionsPerAttempt());
        dto.setAllowOvertimeSubmission(quiz.getAllowOvertimeSubmission());
        dto.setPublished(quiz.getPublished());
        dto.setTotalQuestions(questionRepository.countByQuiz(quiz));
        dto.setTotalAttempts(attemptRepository.countByQuiz(quiz));
        dto.setCreatedAt(quiz.getCreatedAt());
        return dto;
    }
}
