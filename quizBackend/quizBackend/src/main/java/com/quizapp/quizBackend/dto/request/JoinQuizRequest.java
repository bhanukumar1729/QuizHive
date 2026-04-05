package com.quizapp.quizBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinQuizRequest {

    @NotBlank
    private String quizCode;
}
