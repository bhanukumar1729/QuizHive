package com.quizapp.quizBackend.dto.response;
import lombok.Data;

@Data
public class SubmitResponse {
    private Integer score;
    private Integer totalMarks;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double percentage;
}
