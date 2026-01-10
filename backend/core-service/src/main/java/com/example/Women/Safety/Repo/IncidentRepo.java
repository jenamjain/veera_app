package com.example.Women.Safety.Repo;

import com.example.Women.Safety.Entity.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepo extends MongoRepository<Incident, String> {
}
