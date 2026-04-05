package com.quizapp.quizBackend.controller;

import com.quizapp.quizBackend.dto.response.ResultDTO;
import com.quizapp.quizBackend.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/result")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    /**
     * Faculty: get all submitted results for a quiz.
     * GET /api/result/quiz/{quizId}
     */
    @GetMapping("/quiz/{quizId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<ResultDTO>> getQuizResults(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(resultService.getResultsForQuiz(quizId, email));
    }

    /**
     * Student: get all their submitted attempts across all quizzes.
     * GET /api/result/me/history
     */
    @GetMapping("/me/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ResultDTO>> getMyAttempts(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(resultService.getMyAttempts(email));
    }

    /**
     * Student: get their own result for a specific quiz.
     * GET /api/result/me/{quizCode}
     */
    @GetMapping("/me/{quizCode}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResultDTO> getMyResult(
            @AuthenticationPrincipal String email,
            @PathVariable String quizCode) {
        return ResponseEntity.ok(resultService.getMyResult(quizCode, email));
    }
}