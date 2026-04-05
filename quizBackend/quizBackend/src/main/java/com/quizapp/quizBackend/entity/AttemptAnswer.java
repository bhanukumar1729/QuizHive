package com.quizapp.quizBackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attempt_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private StudentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    /**
     * The index within the SHUFFLED options list that was presented to this student.
     * Null means the student skipped this question.
     */
    private Integer chosenShuffledIndex;

    /**
     * The original (canonical) option index stored after de-shuffling.
     * Used for grading against question.correctOptionIndex.
     */
    private Integer chosenOriginalIndex;

    private Boolean correct;
}
