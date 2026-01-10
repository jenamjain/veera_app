package com.example.Women.Safety.Controller;

import com.example.Women.Safety.Dto.SosResponse;
import com.example.Women.Safety.Entity.Incident;
import com.example.Women.Safety.Services.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SosController {

    private final IncidentService incidentService;

    public SosController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping("/sos")
    public ResponseEntity<SosResponse> createSos(@RequestBody Incident request) {
        Incident saved = incidentService.createIncident(request);

        SosResponse response = new SosResponse();
        response.setRiskLevel(String.valueOf(saved.getRiskLevel()));
        response.setRiskScore(saved.getRiskScore().intValue());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }   
}