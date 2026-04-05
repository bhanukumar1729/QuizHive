package com.quizapp.quizBackend.dto.response;
import lombok.Data;
import java.time.Instant;

@Data
public class QuizSummaryDTO {
    private Long id;
    private String title;
    private String description;
    private String code;
    private Instant windowStart;
    private Instant windowEnd;
    private Integer durationMinutes;
    private Integer questionsPerAttempt;
    private Boolean allowOvertimeSubmission;
    private Boolean published;
    private Long totalQuestions;
    private Long totalAttempts;
    private Instant createdAt;
}