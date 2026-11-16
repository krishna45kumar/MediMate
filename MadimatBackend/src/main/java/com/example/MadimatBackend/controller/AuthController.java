package com.example.MadimatBackend.controller;

import com.example.MadimatBackend.model.User;
import com.example.MadimatBackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST: Register
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.registerUser(user);
    }

    // POST: Login
    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return authService.loginUser(user.getEmail(), user.getPassword());
    }
}