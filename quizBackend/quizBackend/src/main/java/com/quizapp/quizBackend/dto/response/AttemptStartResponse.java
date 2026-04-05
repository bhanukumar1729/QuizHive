package com.quizapp.quizBackend.dto.response;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class AttemptStartResponse {
    private Long attemptId;
    private String quizTitle;
    private Instant deadline;
    private List<QuestionDTO> questions;
}