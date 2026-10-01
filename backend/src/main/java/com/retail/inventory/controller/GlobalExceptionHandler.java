package com.retail.inventory.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflict(org.springframework.dao.DataIntegrityViolationException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This record is already in use and cannot be changed or deleted. Please remove linked inventory, orders or products first.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleBadJson(org.springframework.http.converter.HttpMessageNotReadableException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Some details look incorrect. Please check dates, numbers and try again.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> response = new HashMap<>();
        String msg = e.getMessage();
        if (msg == null || msg.isBlank() || msg.length() > 200) {
            msg = "Something went wrong on our side. Please try again in a moment.";
        }
        response.put("message", msg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Something went wrong on our side. Please try again in a moment.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
