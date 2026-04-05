package com.quizapp.quizBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    /** Unique 8-char code students use to join */
    @Column(nullable = false, unique = true, length = 8)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /** When students are allowed to start joining */
    @Column(nullable = false)
    private Instant windowStart;

    /** After this time, no new joins accepted */
    @Column(nullable = false)
    private Instant windowEnd;

    /** How long each student gets from their join time (minutes) */
    @Column(nullable = false)
    private Integer durationMinutes;

    /** How many questions to serve per student (random selection) */
    @Column(nullable = false)
    private Integer questionsPerAttempt;

    /**
     * If true, student may exceed the window end time by their remaining
     * personal duration. If false, they are hard-capped at windowEnd.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean allowOvertimeSubmission = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudentAttempt> attempts = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}