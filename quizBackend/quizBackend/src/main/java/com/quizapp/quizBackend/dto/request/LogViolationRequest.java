package com.quizapp.quizBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LogViolationRequest {

    @NotNull
    private Long attemptId;

    @NotBlank
    private String violationType;
}
