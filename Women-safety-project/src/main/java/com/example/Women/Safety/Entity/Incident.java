package com.example.Women.Safety.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mongodb.lang.NonNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.lang.annotation.Documented;

@Data
@Document(collection = "LocDetails")
public class Incident {
//    @Id
//    private String userId;
//
//    private String username;
//    private double latitude;
//    private double longitude;
//    private double hour;
//    private double crime_density;
//    private double poi_count;
//    private boolean night;
//    private boolean isolated;
//
//    //ML
//    private Integer riskScore;
//    private RiskLevel riskLevel;

//    v2
@Id
private String userId;

    private String username;
    private double latitude;
    private double longitude;
    private int hour;

    private double crimeDensity;

    private int poiCount;

    private boolean night;

    private boolean isolated;

    private Integer riskScore;
    private RiskLevel riskLevel;
}