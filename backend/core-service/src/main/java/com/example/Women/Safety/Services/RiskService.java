package com.example.Women.Safety.Services;
import com.example.Women.Safety.Dto.FrontendRiskRequest;
import com.example.Women.Safety.Dto.MlRiskRequest;
import com.example.Women.Safety.Dto.MlRiskResponse;
import com.example.Women.Safety.Entity.Incident;
import com.example.Women.Safety.Entity.RiskLevel;
import com.example.Women.Safety.Repo.IncidentRepo;
import org.springframework.stereotype.Service;

@Service
public class RiskService {

    private final MlClientService mlClientService;
    private final IncidentRepo repository;

    public RiskService(MlClientService mlClientService,
                       IncidentRepo repository) {
        this.mlClientService = mlClientService;
        this.repository = repository;
    }

    public MlRiskResponse processRisk(FrontendRiskRequest req) {

        //Build ML request
        MlRiskRequest mlReq = new MlRiskRequest();
        mlReq.setLongitude(req.getLongitude());
        mlReq.setHour(req.getHour());
        mlReq.setCrimeDensity(req.getCrime_density());
        mlReq.setPoiCount(req.getPoi_count());
        mlReq.setNight(req.getNight());
        mlReq.setIsolated(req.getIsolated());


        //Call ML
        MlRiskResponse mlRes = mlClientService.callMlModel(mlReq);

        // Save to DB
        Incident incident = new Incident();
        incident.setUserId(req.userId);
        incident.setUsername(req.username);
        incident.setLatitude(req.latitude);
        incident.setLongitude(req.longitude);
        incident.setHour(req.hour);
        incident.setCrimeDensity(req.crime_density);
        incident.setPoiCount(req.poi_count);
        incident.setNight(req.night);
        incident.setIsolated(req.isolated);

        incident.setRiskScore(mlRes.getRiskScore());
        incident.setRiskLevel(RiskLevel.valueOf(mlRes.getRiskLevel()));
        repository.save(incident);

        //Return ML
        return mlRes;
    }
}
