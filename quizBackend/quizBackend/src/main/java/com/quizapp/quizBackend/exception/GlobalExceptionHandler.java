package com.quizapp.quizBackend.exception;

import com.quizapp.quizBackend.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(QuizNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(QuizNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler({QuizNotOpenException.class, QuizClosedException.class})
    public ResponseEntity<ApiResponse> handleWindowError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AlreadyAttemptedException.class)
    public ResponseEntity<ApiResponse> handleAlreadyAttempted(AlreadyAttemptedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler({AttemptExpiredException.class, AttemptAlreadySubmittedException.class})
    public ResponseEntity<ApiResponse> handleAttemptErrors(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.GONE).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler({InvalidOtpException.class, InvalidDomainException.class})
    public ResponseEntity<ApiResponse> handleAuthErrors(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal error: " + ex.getMessage()));
    }
}
