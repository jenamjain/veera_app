from pydantic import BaseModel, Field, ConfigDict

class RiskRequest(BaseModel):
    latitude: float
    longitude: float
    hour: int

    crime_density: float = Field(..., alias="crimeDensity")
    poi_count: int = Field(..., alias="poiCount")

    is_night: bool = Field(..., alias="isNight")
    is_isolated: bool = Field(..., alias="isIsolated")

    model_config = ConfigDict(populate_by_name=True)
