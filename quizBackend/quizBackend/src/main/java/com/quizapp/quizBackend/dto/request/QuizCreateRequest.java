package com.quizapp.quizBackend.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class QuizCreateRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private Instant windowStart;
    @NotNull
    private Instant windowEnd;
    @NotNull
    private Integer durationMinutes;
    @NotNull
    private Integer questionsPerAttempt;
    private Boolean allowOvertimeSubmission = true;
    private List<QuestionRequest> questions;
}