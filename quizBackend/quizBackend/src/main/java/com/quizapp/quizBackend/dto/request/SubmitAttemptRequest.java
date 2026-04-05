package com.quizapp.quizBackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAttemptRequest {

    @NotNull
    private Long attemptId;
}
