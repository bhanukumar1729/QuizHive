package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.request.LogViolationRequest;
import com.quizapp.quizBackend.dto.request.SaveAnswerRequest;
import com.quizapp.quizBackend.dto.request.SubmitAttemptRequest;
import com.quizapp.quizBackend.dto.response.AttemptStartResponse;
import com.quizapp.quizBackend.dto.response.QuestionDTO;
import com.quizapp.quizBackend.dto.response.SubmitResponse;
import com.quizapp.quizBackend.entity.*;
import com.quizapp.quizBackend.exception.*;
import com.quizapp.quizBackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final QuizRepository quizRepository;
    private final StudentAttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService questionService;

    @Transactional
    public AttemptStartResponse joinQuiz(String studentEmail, String quizCode) {
        Quiz quiz = quizRepository.findByCode(quizCode)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found for code: " + quizCode));

        if (!quiz.getPublished()) {
            throw new QuizNotOpenException("This quiz has not been published yet");
        }

        Instant now = Instant.now();
        if (now.isBefore(quiz.getWindowStart())) {
            throw new QuizNotOpenException("Quiz window has not opened yet. Opens at: " + quiz.getWindowStart());
        }
        if (now.isAfter(quiz.getWindowEnd())) {
            throw new QuizClosedException("Quiz window has closed at: " + quiz.getWindowEnd());
        }

        if (attemptRepository.existsByQuizAndStudentEmail(quiz, studentEmail)) {
            throw new AlreadyAttemptedException("You have already attempted this quiz");
        }

        Instant deadline = now.plusSeconds(quiz.getDurationMinutes() * 60L);
        if (!quiz.getAllowOvertimeSubmission() && deadline.isAfter(quiz.getWindowEnd())) {
            deadline = quiz.getWindowEnd();
        }

        String studentName = userRepository.findByEmail(studentEmail)
                .map(User::getName).orElse(studentEmail);

        StudentAttempt attempt = StudentAttempt.builder()
                .quiz(quiz)
                .studentEmail(studentEmail)
                .studentName(studentName)
                .joinedAt(now)
                .deadline(deadline)
                .submitted(false)
                .violationCount(0)
                .build();
        attemptRepository.save(attempt);

        List<QuestionDTO> questions = questionService.getRandomShuffledQuestions(quiz);

        AttemptStartResponse response = new AttemptStartResponse();
        response.setAttemptId(attempt.getId());
        response.setQuizTitle(quiz.getTitle());
        response.setDeadline(deadline);
        response.setQuestions(questions);
        return response;
    }

    @Transactional
    public void saveAnswer(String studentEmail, SaveAnswerRequest req) {
        StudentAttempt attempt = getActiveAttempt(req.getAttemptId(), studentEmail);
        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Integer originalIndex = null;
        Boolean correct = null;
        if (req.getChosenShuffledIndex() != null) {
            originalIndex = questionService.resolveOriginalIndex(req.getShuffleMap(), req.getChosenShuffledIndex());
            correct = originalIndex.equals(question.getCorrectOptionIndex());
        }

        AttemptAnswer answer = answerRepository
                .findByAttemptAndQuestionId(attempt, req.getQuestionId())
                .orElse(AttemptAnswer.builder().attempt(attempt).question(question).build());

        answer.setChosenShuffledIndex(req.getChosenShuffledIndex());
        answer.setChosenOriginalIndex(originalIndex);
        answer.setCorrect(correct);
        answerRepository.save(answer);
    }

    @Transactional
    public SubmitResponse submitAttempt(String studentEmail, SubmitAttemptRequest req) {
        StudentAttempt attempt = getActiveAttempt(req.getAttemptId(), studentEmail);
        List<AttemptAnswer> answers = answerRepository.findByAttempt(attempt);

        int score = 0, totalMarks = 0, correctCount = 0;
        for (AttemptAnswer ans : answers) {
            totalMarks += ans.getQuestion().getMarks();
            if (Boolean.TRUE.equals(ans.getCorrect())) {
                score += ans.getQuestion().getMarks();
                correctCount++;
            }
        }

        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        attempt.setSubmitted(true);
        attempt.setSubmittedAt(Instant.now());
        attemptRepository.save(attempt);

        SubmitResponse response = new SubmitResponse();
        response.setScore(score);
        response.setTotalMarks(totalMarks);
        response.setTotalQuestions(answers.size());
        response.setCorrectAnswers(correctCount);
        response.setPercentage(totalMarks > 0 ? (score * 100.0 / totalMarks) : 0.0);
        return response;
    }

    @Transactional
    public void logViolation(String studentEmail, LogViolationRequest req) {
        StudentAttempt attempt = attemptRepository.findById(req.getAttemptId())
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getStudentEmail().equals(studentEmail)) throw new SecurityException("Access denied");

        attempt.setViolationCount(attempt.getViolationCount() + 1);
        if (attempt.getViolationCount() >= 2 && !attempt.getSubmitted()) {
            SubmitAttemptRequest autoSubmit = new SubmitAttemptRequest();
            autoSubmit.setAttemptId(req.getAttemptId());
            submitAttempt(studentEmail, autoSubmit);
        } else {
            attemptRepository.save(attempt);
        }
    }

    private StudentAttempt getActiveAttempt(Long attemptId, String email) {
        StudentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        if (!attempt.getStudentEmail().equals(email)) throw new SecurityException("Access denied");
        if (attempt.getSubmitted()) throw new AttemptAlreadySubmittedException("Attempt already submitted");
        if (Instant.now().isAfter(attempt.getDeadline())) {
            SubmitAttemptRequest req = new SubmitAttemptRequest();
            req.setAttemptId(attemptId);
            submitAttempt(email, req);
            throw new AttemptExpiredException("Your time is up — attempt auto-submitted");
        }
        return attempt;
    }
}