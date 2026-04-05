package com.quizapp.quizBackend.service;

import com.quizapp.quizBackend.entity.OtpRecord;
import com.quizapp.quizBackend.exception.InvalidOtpException;
import com.quizapp.quizBackend.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final JavaMailSender mailSender;

    @Value("${otp.expiry.minutes}")
    private int otpExpiryMinutes;

    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public void sendOtp(String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));

        OtpRecord record = OtpRecord.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .used(false)
                .build();
        otpRepository.save(record);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Quiz OTP");
        message.setText("Your OTP is: " + code + "\n\nValid for " + otpExpiryMinutes + " minutes.");
        mailSender.send(message);
    }

    @Transactional
    public void verifyOtp(String email, String code) {
        OtpRecord record = otpRepository.findTopByEmailOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new InvalidOtpException("No OTP found for this email"));

        if (record.getUsed()) {
            throw new InvalidOtpException("OTP already used");
        }
        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            throw new InvalidOtpException("OTP has expired");
        }
        if (!record.getCode().equals(code)) {
            throw new InvalidOtpException("Invalid OTP");
        }

        record.setUsed(true);
        otpRepository.save(record);
    }

    /** Clean up expired OTPs every hour */
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void purgeExpired() {
        otpRepository.deleteExpired(LocalDateTime.now());
    }
}
