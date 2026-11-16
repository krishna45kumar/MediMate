package com.example.MadimatBackend.service;

import com.example.MadimatBackend.model.User;
import com.example.MadimatBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register new user
    public User registerUser(User user) {
        // Password encrypt kar rahe hain security ke liye
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Login validation
    public String loginUser(String email, String rawPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Password match check kar rahe hain
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                return "Login Successful!";
            }
        }
        return "Invalid Email or Password!";
    }
}