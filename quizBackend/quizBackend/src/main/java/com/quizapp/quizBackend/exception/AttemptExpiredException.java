package com.quizapp.quizBackend.exception;

public class AttemptExpiredException extends RuntimeException {
    public AttemptExpiredException(String message) { super(message); }
}
