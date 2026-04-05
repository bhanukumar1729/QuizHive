package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.response.ExcelPreviewDTO;
import com.quizapp.quizBackend.dto.response.ExcelPreviewDTO.ExcelRowDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Expected Excel column layout (row 1 = header, skipped):
 *  A: Question text
 *  B: Option A
 *  C: Option B
 *  D: Option C
 *  E: Option D
 *  F: Correct answer — accepts BOTH formats:
 *       Letter:  A / B / C / D  (case-insensitive)
 *       Number:  1 / 2 / 3 / 4  (1-based)
 *  G: Marks (optional, defaults to 1)
 */
@Service
public class ExcelService {

    public ExcelPreviewDTO parseAndPreview(MultipartFile file) throws IOException {
        ExcelPreviewDTO preview = new ExcelPreviewDTO();
        List<ExcelRowDTO> rows = new ArrayList<>();
        List<String> globalErrors = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int validCount = 0;
            int errorCount = 0;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                ExcelRowDTO dto = new ExcelRowDTO();
                dto.setRowNumber(i + 1);

                try {
                    String questionText = getCellString(row, 0);
                    String opt1 = getCellString(row, 1);
                    String opt2 = getCellString(row, 2);
                    String opt3 = getCellString(row, 3);
                    String opt4 = getCellString(row, 4);
                    String correctRaw = getCellString(row, 5);
                    String marksRaw = getCellString(row, 6);

                    // Validate required fields
                    if (questionText.isBlank()) throw new IllegalArgumentException("Question text is empty");
                    if (opt1.isBlank() || opt2.isBlank()) throw new IllegalArgumentException("Need at least 2 options");

                    int correctIdx = parseCorrectIndex(correctRaw);
                    List<String> options = buildOptionList(opt1, opt2, opt3, opt4);

                    if (correctIdx < 0 || correctIdx >= options.size()) {
                        throw new IllegalArgumentException("Correct option index out of range");
                    }

                    int marks = marksRaw.isBlank() ? 1 : (int) Double.parseDouble(marksRaw);

                    dto.setQuestionText(questionText);
                    dto.setOptions(options);
                    dto.setCorrectOptionIndex(correctIdx);
                    dto.setMarks(marks);
                    dto.setStatus("OK");
                    validCount++;

                } catch (Exception e) {
                    dto.setStatus("ERROR");
                    dto.setErrorMessage(e.getMessage());
                    errorCount++;
                }

                rows.add(dto);
            }

            preview.setTotalRows(rows.size());
            preview.setValidRows(validCount);
            preview.setErrorRows(errorCount);
            preview.setRows(rows);
            preview.setErrors(globalErrors);
        }

        return preview;
    }

    /**
     * Accepts both letter and number formats:
     *   "A" / "a" → 0,  "B" / "b" → 1,  "C" / "c" → 2,  "D" / "d" → 3
     *   "1"        → 0,  "2"        → 1,  "3"        → 2,  "4"        → 3
     */
    private int parseCorrectIndex(String raw) {
        if (raw == null || raw.isBlank()) throw new IllegalArgumentException("Correct answer is empty");
        String trimmed = raw.trim().toUpperCase();
        // Letter format: A, B, C, D
        if (trimmed.length() == 1 && trimmed.charAt(0) >= 'A' && trimmed.charAt(0) <= 'Z') {
            int idx = trimmed.charAt(0) - 'A';
            if (idx > 3) throw new IllegalArgumentException("Correct answer letter out of range: " + raw);
            return idx;
        }
        // Number format: 1, 2, 3, 4
        try {
            int num = (int) Double.parseDouble(trimmed);
            if (num < 1 || num > 4) throw new IllegalArgumentException("Correct answer number out of range: " + raw);
            return num - 1;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Cannot parse correct answer: '" + raw + "'. Use A/B/C/D or 1/2/3/4");
        }
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> "";
        };
    }

    private List<String> buildOptionList(String o1, String o2, String o3, String o4) {
        List<String> opts = new ArrayList<>();
        opts.add(o1);
        opts.add(o2);
        if (!o3.isBlank()) opts.add(o3);
        if (!o4.isBlank()) opts.add(o4);
        return opts;
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}