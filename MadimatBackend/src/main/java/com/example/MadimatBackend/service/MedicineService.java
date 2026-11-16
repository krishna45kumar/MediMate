package com.example.MadimatBackend.service;

import com.example.MadimatBackend.model.Medicine;
import com.example.MadimatBackend.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.module.ModuleDescriptor;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MedicineService {
    @Autowired
    private MedicineRepository medicineRepository;
    // get all medicine
    public List<Medicine> getAllMedicines(){
        return medicineRepository.findAll();
    }
    //save krne ke liye
    public Medicine saveMedicine(Medicine medicine ){
        return medicineRepository.save(medicine);

    }
    //Delete
    public void deleteMedicine(Long id){
        medicineRepository.deleteById(id);
    }

    // dose ke baad tick krne ke liye

    public Medicine toggleTakenStatus(Long id){
        Optional<Medicine> optionalMedicine =medicineRepository.findById(id);
        if(optionalMedicine.isPresent()){
            Medicine medicine=optionalMedicine.get();
            medicine.setIsTaken(!medicine.getIsTaken());
            return medicineRepository.save(medicine);
        }
        return null;
    }

    public Map<String ,Object> getWeeklyProgress(){
        List<Medicine>  medicines = medicineRepository.findAll();

        int total = medicines.size();

        long takenCount=medicines.stream().filter(Medicine::getIsTaken).count();

        double progressPercentage=total>0 ? ((double) takenCount/total)*100:0.0;

        Map<String ,Object> progressReport=new HashMap<>();

        progressReport.put("total Medicines",total);
        progressReport.put("completeDoses",takenCount);
        progressReport.put("pendingDoses",total - takenCount);
        progressReport.put("ProgressPercentage",progressPercentage);
        return progressReport;
    }




}
