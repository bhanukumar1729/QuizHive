package com.quizapp.quizBackend.exception;

public class AlreadyAttemptedException extends RuntimeException {
    public AlreadyAttemptedException(String message) { super(message); }
}
