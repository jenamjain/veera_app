package com.example.Women.Safety.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SosResponse {
    private Integer riskScore;
    private String riskLevel;
}
