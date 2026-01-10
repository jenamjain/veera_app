package com.example.Women.Safety.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Collection;

@Document(collection = "predict")
@Data
public class Prediction {
    @Id
    private double riskScore;
    private String riskLevel;

//    public double getRiskScore() {
//        return riskScore;
//    }
//
//    public void setRiskScore(double riskScore) {
//        this.riskScore = riskScore;
//    }
//
//    public String getRiskLevel() {
//        return riskLevel;
//    }
//
//    public void setRiskLevel(String riskLevel) {
//        this.riskLevel = riskLevel;
//    }
}
