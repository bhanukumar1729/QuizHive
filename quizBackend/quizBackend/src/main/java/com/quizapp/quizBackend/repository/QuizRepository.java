package com.quizapp.quizBackend.repository;

import com.quizapp.quizBackend.entity.Quiz;
import com.quizapp.quizBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByCode(String code);
    List<Quiz> findByCreatedByOrderByCreatedAtDesc(User faculty);
}
