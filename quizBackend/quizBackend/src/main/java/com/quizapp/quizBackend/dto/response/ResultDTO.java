package com.quizapp.quizBackend.dto.response;
import lombok.Data;
import java.time.Instant;

@Data
public class ResultDTO {
    private Long attemptId;
    private String quizTitle;
    private String quizCode;
    private String studentEmail;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private Instant joinedAt;
    private Instant submittedAt;
    private Integer violationCount;
}