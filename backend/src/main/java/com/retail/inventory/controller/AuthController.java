package com.retail.inventory.controller;

import com.retail.inventory.model.User;
import com.retail.inventory.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email exists
        Optional<User> existing = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(user.getEmail()))
                .findFirst();
                
        if (existing.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email already in use");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setCreatedAt(LocalDateTime.now());
        
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); // Do not return password
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("data", savedUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                .findFirst();
                
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (BCrypt.checkpw(loginRequest.getPassword(), user.getPassword())) {
                user.setPassword(null); // Do not return password
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("data", user);
                return ResponseEntity.ok(response);
            }
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
