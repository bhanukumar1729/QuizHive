package com.quizapp.quizBackend.repository;

import com.quizapp.quizBackend.entity.Question;
import com.quizapp.quizBackend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuiz(Quiz quiz);
    List<Question> findByQuizId(Long quizId);
    long countByQuiz(Quiz quiz);
}
