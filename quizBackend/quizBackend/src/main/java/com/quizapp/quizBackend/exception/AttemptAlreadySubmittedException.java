package com.quizapp.quizBackend.exception;

public class AttemptAlreadySubmittedException extends RuntimeException {
    public AttemptAlreadySubmittedException(String message) { super(message); }
}
