package com.example.MadimatBackend.repository;

import com.example.MadimatBackend.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
}
