package com.quizapp.quizBackend.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class JwtResponse {
    private String token;
    private String email;
    private String name;
    private String role;
}
