package com.quizapp.quizBackend.controller;

import com.quizapp.quizBackend.dto.request.SendOtpRequest;
import com.quizapp.quizBackend.dto.request.VerifyOtpRequest;
import com.quizapp.quizBackend.dto.response.ApiResponse;
import com.quizapp.quizBackend.dto.response.JwtResponse;
import com.quizapp.quizBackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Step 1: Send OTP to college email.
     * POST /api/auth/send-otp
     * Body: { "email": "student@college.edu", "name": "John", "role": "STUDENT" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("OTP sent to " + request.getEmail()));
    }

    /**
     * Step 2: Verify OTP and receive JWT.
     * POST /api/auth/verify-otp
     * Body: { "email": "student@college.edu", "otp": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }
}
