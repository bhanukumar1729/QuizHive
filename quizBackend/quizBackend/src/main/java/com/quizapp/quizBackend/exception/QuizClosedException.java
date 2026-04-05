package com.quizapp.quizBackend.exception;

public class QuizClosedException extends RuntimeException {
    public QuizClosedException(String message) { super(message); }
}
