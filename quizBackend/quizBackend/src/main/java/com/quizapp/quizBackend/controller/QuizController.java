package com.quizapp.quizBackend.controller;

import com.quizapp.quizBackend.dto.request.QuestionRequest;
import com.quizapp.quizBackend.dto.request.QuizCreateRequest;
import com.quizapp.quizBackend.dto.response.ApiResponse;
import com.quizapp.quizBackend.dto.response.QuizSummaryDTO;
import com.quizapp.quizBackend.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /** Create a new quiz (with optional inline questions) */
    @PostMapping
    public ResponseEntity<QuizSummaryDTO> createQuiz(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody QuizCreateRequest request) {
                System.out.println(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.createQuiz(email, request));
    }

    /** Add questions to an existing quiz */
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuizSummaryDTO> addQuestions(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId,
            @Valid @RequestBody List<QuestionRequest> questions) {
        return ResponseEntity.ok(quizService.addQuestions(quizId, email, questions));
    }

    /** Publish quiz — makes it joinable by students */
    @PatchMapping("/{quizId}/publish")
    public ResponseEntity<QuizSummaryDTO> publishQuiz(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.publishQuiz(quizId, email));
    }

    /** Get all quizzes created by this faculty */
    @GetMapping
    public ResponseEntity<List<QuizSummaryDTO>> getMyQuizzes(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(quizService.getMyQuizzes(email));
    }

    /** Get a single quiz by ID */
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizSummaryDTO> getQuiz(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId, email));
    }

    /** Delete a quiz */
    @DeleteMapping("/{quizId}")
    public ResponseEntity<ApiResponse> deleteQuiz(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId) {
        quizService.deleteQuiz(quizId, email);
        return ResponseEntity.ok(ApiResponse.ok("Quiz deleted"));
    }
}
