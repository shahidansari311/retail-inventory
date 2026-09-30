package com.retail.inventory.controller;

import com.retail.inventory.model.User;
import com.retail.inventory.repository.UserRepository;
import com.retail.inventory.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Conflict", "message", "Email already in use"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(savedUser.getEmail(), savedUser.getRole());
        String refreshToken = jwtService.generateRefreshToken(savedUser.getEmail());

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        savedUser.setPassword(null);
        savedUser.setRefreshToken(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User registered successfully",
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "data", savedUser
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Invalid email or password"));
        }

        User user = userOpt.get();
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "data", userData
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        if (refreshToken == null || !jwtService.isTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Invalid or expired refresh token"));
        }

        String email = jwtService.extractEmail(refreshToken);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !refreshToken.equals(userOpt.get().getRefreshToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Refresh token mismatch"));
        }

        User user = userOpt.get();
        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(newRefreshToken);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setRefreshToken(null);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            });
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
