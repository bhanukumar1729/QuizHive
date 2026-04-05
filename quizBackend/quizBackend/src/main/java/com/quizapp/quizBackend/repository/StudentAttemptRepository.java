package com.quizapp.quizBackend.repository;

import com.quizapp.quizBackend.entity.Quiz;
import com.quizapp.quizBackend.entity.StudentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentAttemptRepository extends JpaRepository<StudentAttempt, Long> {
    Optional<StudentAttempt> findByQuizAndStudentEmail(Quiz quiz, String email);
    boolean existsByQuizAndStudentEmail(Quiz quiz, String email);
    List<StudentAttempt> findByQuizOrderByScoreDesc(Quiz quiz);
    List<StudentAttempt> findByStudentEmail(String email);
    long countByQuiz(Quiz quiz);
}
