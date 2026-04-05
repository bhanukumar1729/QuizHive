package com.quizapp.quizBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_attempts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"quiz_id", "student_email"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "student_email", nullable = false)
    private String studentEmail;

    @Column(name = "student_name")
    private String studentName;

    /** Set once when student clicks "Start quiz" — never updated */
    @Column(nullable = false)
    private Instant joinedAt;

    /** joinedAt + quiz.durationMinutes (capped at windowEnd if !allowOvertime) */
    @Column(nullable = false)
    private Instant deadline;

    @Column(nullable = false)
    @Builder.Default
    private Boolean submitted = false;

    private Instant submittedAt;

    /** Score computed at submission time */
    private Integer score;

    /** Total possible marks for this attempt's question set */
    private Integer totalMarks;

    /** Violation count (tab switches, etc.) */
    @Column(nullable = false)
    @Builder.Default
    private Integer violationCount = 0;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AttemptAnswer> answers = new ArrayList<>();
}