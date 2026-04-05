package com.quizapp.quizBackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaveAnswerRequest {

    @NotNull
    private Long attemptId;

    @NotNull
    private Long questionId;

    private Integer chosenShuffledIndex;

    @NotNull
    private List<Integer> shuffleMap;
}
