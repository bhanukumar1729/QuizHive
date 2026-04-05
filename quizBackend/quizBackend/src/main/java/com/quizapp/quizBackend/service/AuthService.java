package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.dto.request.SendOtpRequest;
import com.quizapp.quizBackend.dto.request.VerifyOtpRequest;
import com.quizapp.quizBackend.dto.response.JwtResponse;
import com.quizapp.quizBackend.entity.User;
import com.quizapp.quizBackend.exception.InvalidDomainException;
import com.quizapp.quizBackend.repository.UserRepository;
import com.quizapp.quizBackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    @Value("${app.college.domains}")
    private String allowedDomains;

    @Transactional
    public void sendOtp(SendOtpRequest request) {
        validateDomain(request.getEmail());

        // Auto-register user if first time
        if (!userRepository.existsByEmail(request.getEmail())) {
            User user = User.builder()
                    .email(request.getEmail())
                    .name(request.getName())
                    .role(User.Role.valueOf(request.getRole().toUpperCase()))
                    .build();
            userRepository.save(user);
        }

        otpService.sendOtp(request.getEmail());
    }

    @Transactional
    public JwtResponse verifyOtp(VerifyOtpRequest request) {
        validateDomain(request.getEmail());

        otpService.verifyOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found — send OTP first"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new JwtResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    private void validateDomain(String email) {
        List<String> domains = Arrays.asList(allowedDomains.split(","));
        String emailDomain = email.substring(email.indexOf('@') + 1).trim();
        boolean allowed = domains.stream()
                .anyMatch(d -> d.trim().equalsIgnoreCase(emailDomain));
        if (!allowed) {
            throw new InvalidDomainException(
                "Email domain not allowed. Use your college email address.");
        }
    }
}
