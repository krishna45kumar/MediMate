package com.example.MadimatBackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Timing timing;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isTaken = false;

    public enum Timing {
        Morning,
        Afternoon,
        Night
    }
}
