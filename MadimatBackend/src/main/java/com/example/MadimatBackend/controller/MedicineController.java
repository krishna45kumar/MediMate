package com.example.MadimatBackend.controller;

import com.example.MadimatBackend.model.Medicine;
import com.example.MadimatBackend.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping
    public List<Medicine> getAllMedicines(){
        return medicineService.getAllMedicines();
    }
    @PostMapping
    public Medicine addMedicines(@RequestBody Medicine medicine){
        return medicineService.saveMedicine(medicine);
    }

    // PUT: Update taken status (Mark as taken)
    @PutMapping("/{id}/toggle")
    public Medicine toggleTakenStatus(@PathVariable Long id){
        return medicineService.toggleTakenStatus(id);
    }

    //Delete
    @DeleteMapping("/{id}")
    public String deleteMedicine(@PathVariable Long id){
        medicineService.deleteMedicine(id);
        return "Medicine deleted succesfully with id:"+id;
    }
    @GetMapping("/progress")
    public Map<String, Object> getProgressReport(){
        return medicineService.getWeeklyProgress();
    }


}

