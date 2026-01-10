package com.example.Women.Safety.Dto;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class FrontendRiskRequest {

    @Id
    public String userId;


    public String username;
    public Double latitude;
    public Double longitude;

    public Integer hour;
    public Double crime_density;
    public Integer poi_count;

    public Boolean night;
    public Boolean isolated;
}
