package com.quizapp.quizBackend.controller;

import com.quizapp.quizBackend.dto.request.JoinQuizRequest;
import com.quizapp.quizBackend.dto.request.LogViolationRequest;
import com.quizapp.quizBackend.dto.request.SaveAnswerRequest;
import com.quizapp.quizBackend.dto.request.SubmitAttemptRequest;
import com.quizapp.quizBackend.dto.response.AttemptStartResponse;
import com.quizapp.quizBackend.dto.response.ApiResponse;
import com.quizapp.quizBackend.dto.response.SubmitResponse;
import com.quizapp.quizBackend.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempt")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    /**
     * Student joins a quiz using its code.
     * Returns the question set + personal deadline.
     * POST /api/attempt/join
     */
    @PostMapping("/join")
    public ResponseEntity<AttemptStartResponse> join(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody JoinQuizRequest request) {
        return ResponseEntity.ok(attemptService.joinQuiz(email, request.getQuizCode()));
    }

    /**
     * Auto-save a single answer (called on each option selection).
     * POST /api/attempt/answer
     */
    @PostMapping("/answer")
    public ResponseEntity<ApiResponse> saveAnswer(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SaveAnswerRequest request) {
        attemptService.saveAnswer(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Answer saved"));
    }

    /**
     * Final submit — grades and locks the attempt.
     * POST /api/attempt/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<SubmitResponse> submit(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SubmitAttemptRequest request) {
        return ResponseEntity.ok(attemptService.submitAttempt(email, request));
    }

    /**
     * Log a violation event (tab switch, copy attempt, etc.).
     * POST /api/attempt/violation
     */
    @PostMapping("/violation")
    public ResponseEntity<ApiResponse> logViolation(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody LogViolationRequest request) {
        attemptService.logViolation(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Violation logged"));
    }
}
