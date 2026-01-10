//package com.example.Women.Safety.Services;
//
//import com.example.Women.Safety.Dto.MlRiskResponse;
//import com.example.Women.Safety.Entity.Incident;
//import com.example.Women.Safety.Entity.RiskLevel;
//import com.example.Women.Safety.Repo.IncidentRepo;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//@Service
//public class IncidentService {
//
//    private final IncidentRepo incidentRepo;
//    @Autowired
//    private MlClientService mlClientService;
//
////    public IncidentService(IncidentRepo incidentRepo) {
////        this.incidentRepo = incidentRepo;
////    }
//public IncidentService(
//        IncidentRepo incidentRepo,
//        MlClientService mlClientService
//) {
//    this.incidentRepo = incidentRepo;
//    this.mlClientService = mlClientService;
//}
//
//    public Incident createIncident(Incident request) {
//
//        Incident incident = new Incident();
//        incident.setUserId(request.getUserId());
//        incident.setUsername(request.getUsername());
//        incident.setLatitude(request.getLatitude());
//        incident.setLongitude(request.getLongitude());
//        incident.setHour(request.getHour());
//        incident.setCrime_density(request.getCrime_density());
//        incident.setIsolated(request.isIsolated());
//        incident.setPoi_count(request.getPoi_count());
//        incident.setNight(request.isNight());
//
//        MlRiskResponse mlResponse = mlClientService.predictRisk(incident);
//
//        incident.setRiskScore(mlResponse.getRiskScore());
//        incident.setRiskLevel(
//                RiskLevel.valueOf(mlResponse.getRiskLevel())
//        );
//
//
//        // 4. Escalation (simulated)
//        if (incident.getRiskLevel() == RiskLevel.HIGH) {
//            System.out.println("Escalation triggered by ML");
//        }
//
//        return incidentRepo.save(incident);
//    }
//}


//service v2

package com.example.Women.Safety.Services;

import com.example.Women.Safety.Dto.MlRiskRequest;
import com.example.Women.Safety.Dto.MlRiskResponse;
import com.example.Women.Safety.Entity.Incident;
import com.example.Women.Safety.Entity.RiskLevel;
import com.example.Women.Safety.Repo.IncidentRepo;
import org.springframework.stereotype.Service;

@Service
public class IncidentService {

    private final IncidentRepo incidentRepo;
    private final MlClientService mlClientService;

    public IncidentService(
            IncidentRepo incidentRepo,
            MlClientService mlClientService
    ) {
        this.incidentRepo = incidentRepo;
        this.mlClientService = mlClientService;
    }

    public Incident createIncident(Incident request) {

        // Build Incident entity
        Incident incident = new Incident();
        incident.setUserId(request.getUserId());
        incident.setUsername(request.getUsername());
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setHour(request.getHour());
        incident.setCrimeDensity(request.getCrimeDensity());
        incident.setPoiCount(request.getPoiCount());
        incident.setNight(request.isNight());
        incident.setIsolated(request.isIsolated());

        // Build ML request (FEATURES ONLY)
        MlRiskRequest mlReq = new MlRiskRequest();
        mlReq.setLatitude(incident.getLatitude());
        mlReq.setLongitude(incident.getLongitude());
        mlReq.setHour(incident.getHour());
        mlReq.setCrimeDensity(incident.getCrimeDensity());
        mlReq.setPoiCount(incident.getPoiCount());
        mlReq.setNight(incident.isNight());
        mlReq.setIsolated(incident.isIsolated());

        // Call ML service
        MlRiskResponse mlResponse = mlClientService.callMlModel(mlReq);
        if (mlResponse == null ||
                mlResponse.getRiskScore() == null ||
                mlResponse.getRiskLevel() == null) {

            throw new RuntimeException(
                    "Invalid ML response: " + mlResponse
            );
        }

        // Enrich incident with ML result
        incident.setRiskScore(mlResponse.getRiskScore());
        String level = mlResponse.getRiskLevel();

        if (level == null) {
            throw new RuntimeException("ML returned null risk level");
        }

        incident.setRiskLevel(RiskLevel.valueOf(level.toUpperCase()));

        // Escalation (demo)
        if (incident.getRiskLevel() == RiskLevel.HIGH) {
            System.out.println("Escalation triggered by ML");
        }

        //  Save & return
        return incidentRepo.save(incident);
    }
}

