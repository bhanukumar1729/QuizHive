package com.quizapp.quizBackend.dto.response;
import lombok.Data;
import java.util.List;

@Data
public class ExcelPreviewDTO {
    private int totalRows;
    private int validRows;
    private int errorRows;
    private List<ExcelRowDTO> rows;
    private List<String> errors;

    @Data
    public static class ExcelRowDTO {
        private int rowNumber;
        private String questionText;
        private List<String> options;
        private Integer correctOptionIndex;
        private Integer marks;
        private String status;
        private String errorMessage;
    }
}
