package com.quizapp.quizBackend.repository;

import com.quizapp.quizBackend.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpRecord, Long> {
    Optional<OtpRecord> findTopByEmailOrderByExpiresAtDesc(String email);

    @Modifying
    @Query("DELETE FROM OtpRecord o WHERE o.expiresAt < :now")
    void deleteExpired(LocalDateTime now);
}
