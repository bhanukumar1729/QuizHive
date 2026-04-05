package com.quizapp.quizBackend.controller;

import com.quizapp.quizBackend.dto.request.QuestionRequest;
import com.quizapp.quizBackend.dto.response.ApiResponse;
import com.quizapp.quizBackend.dto.response.ExcelPreviewDTO;
import com.quizapp.quizBackend.service.ExcelService;
import com.quizapp.quizBackend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;
    private final QuizService quizService;

    /**
     * Upload an Excel file and get a preview for faculty to review.
     * POST /api/excel/preview
     */
    @PostMapping("/preview")
    public ResponseEntity<ExcelPreviewDTO> preview(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(excelService.parseAndPreview(file));
    }

    /**
     * Faculty confirms the preview and saves all valid questions to a quiz.
     * POST /api/excel/confirm/{quizId}
     * Body: the same ExcelPreviewDTO rows (frontend sends back validated rows)
     */
    @PostMapping("/confirm/{quizId}")
    public ResponseEntity<ApiResponse> confirmAndSave(
            @AuthenticationPrincipal String email,
            @PathVariable Long quizId,
            @RequestBody ExcelPreviewDTO preview) {

        List<QuestionRequest> questionRequests = preview.getRows().stream()
                .filter(row -> "OK".equals(row.getStatus()))
                .map(row -> {
                    QuestionRequest qr = new QuestionRequest();
                    qr.setText(row.getQuestionText());
                    qr.setOptions(row.getOptions());
                    qr.setCorrectOptionIndex(row.getCorrectOptionIndex());
                    qr.setMarks(row.getMarks() != null ? row.getMarks() : 1);
                    return qr;
                })
                .collect(Collectors.toList());

        quizService.addQuestions(quizId, email, questionRequests);
        return ResponseEntity.ok(ApiResponse.ok(questionRequests.size() + " questions added to quiz"));
    }
}
