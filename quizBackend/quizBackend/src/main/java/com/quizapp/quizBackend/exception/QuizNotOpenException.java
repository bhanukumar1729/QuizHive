package com.quizapp.quizBackend.exception;

public class QuizNotOpenException extends RuntimeException {
    public QuizNotOpenException(String message) { super(message); }
}
