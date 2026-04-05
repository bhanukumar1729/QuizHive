package com.quizapp.quizBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /** 0-based index into the options list that is correct */
    @Column(nullable = false)
    private Integer correctOptionIndex;

    /** Optional marks for this question (default 1) */
    @Column(nullable = false)
    @Builder.Default
    private Integer marks = 1;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "option_order")
    @Builder.Default
    private List<Option> options = new ArrayList<>();
}
