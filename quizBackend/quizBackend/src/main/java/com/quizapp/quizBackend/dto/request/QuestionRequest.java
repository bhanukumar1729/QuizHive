package com.quizapp.quizBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {

    @NotBlank
    private String text;

    private Integer marks = 1;

    @NotNull
    private List<String> options;

    @NotNull
    private Integer correctOptionIndex;
}
