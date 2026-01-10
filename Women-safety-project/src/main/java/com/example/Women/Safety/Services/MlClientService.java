//package com.example.Women.Safety.Services;
//
//import com.example.Women.Safety.Dto.MlRiskRequest;
//import com.example.Women.Safety.Dto.MlRiskResponse;
//import com.example.Women.Safety.Entity.Incident;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//@Service
//public class MlClientService {
//        final RestTemplate restTemplate = new RestTemplate();
//    public MlRiskResponse callMlModel(MlRiskRequest request) {
////        MlRiskRequest request = new MlRiskRequest();
////        request.setLatitude(incident.getLatitude());
////        request.setLongitude(incident.getLongitude());
////        request.setHour((int) incident.getHour());
////        request.setCrime_density(incident.getCrime_density());
////        request.setPoi_count((int) incident.getPoi_count());
////        request.setNight(incident.isNight());
////        request.setIsolated(incident.isIsolated());
//
//        return restTemplate.postForObject(
//                "http://localhost:8000/predict",
//                request,
//                MlRiskResponse.class
//        );
//    }
//
//}
package com.example.Women.Safety.Services;

import com.example.Women.Safety.Dto.MlRiskRequest;
import com.example.Women.Safety.Dto.MlRiskResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class MlClientService {


    private final RestTemplate restTemplate = new RestTemplate();
    private static final String ML_URL = "http://localhost:8000/predict";

    public MlRiskResponse callMlModel(MlRiskRequest request) {
        System.out.println("ML REQUEST = " + request);
        try {
            MlRiskResponse response = restTemplate.postForObject(
                    ML_URL,
                    request,
                    MlRiskResponse.class
            );

            if (response == null) {
                throw new RuntimeException("ML service returned null response");
            }

            // 🔴 ABSOLUTE MUST FOR DEBUGGING
            System.out.println("ML RESPONSE SCORE = " + response.getRiskScore());
            System.out.println("ML RESPONSE LEVEL = " + response.getRiskLevel());

            return response;

        } catch (RestClientException ex) {
            // ML unreachable / invalid response / timeout
            throw new RuntimeException("Error calling ML service", ex);
        }
    }
}
