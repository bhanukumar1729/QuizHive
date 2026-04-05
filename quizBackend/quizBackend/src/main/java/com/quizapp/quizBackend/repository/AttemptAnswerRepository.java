package com.quizapp.quizBackend.repository;

import com.quizapp.quizBackend.entity.AttemptAnswer;
import com.quizapp.quizBackend.entity.StudentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    List<AttemptAnswer> findByAttempt(StudentAttempt attempt);
    Optional<AttemptAnswer> findByAttemptAndQuestionId(StudentAttempt attempt, Long questionId);
}
