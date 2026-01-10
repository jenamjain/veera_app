package com.example.Women.Safety.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MlRiskRequest {

        private double latitude;
        private double longitude;
        private int hour;

        @JsonProperty("crimeDensity")
        private double crimeDensity;

        @JsonProperty("poiCount")
        private int poiCount;

        @JsonProperty("isNight")
        private boolean isNight;

        @JsonProperty("isIsolated")
        private boolean isIsolated;

}
