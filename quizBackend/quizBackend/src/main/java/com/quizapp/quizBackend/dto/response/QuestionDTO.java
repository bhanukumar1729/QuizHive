package com.quizapp.quizBackend.dto.response;
import lombok.Data;
import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private String text;
    private Integer marks;
    private List<OptionDTO> options;
    private List<Integer> shuffleMap;
}
