package com.quizapp.quizBackend.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class OptionDTO {
    private int shuffledIndex;
    private String text;
}
