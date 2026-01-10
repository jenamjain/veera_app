def calculate_risk(row: dict, high_prob: float):
    """
    Final risk calculation logic.
    Single source of truth.
    """

    crime = row["crime_density"]
    night = row["is_night"]
    isolated = row["is_isolated"]

    # -----------------------------
    # STRICT HIGH-RISK OVERRIDES
    # -----------------------------
    if crime >= 7:
        return 95, "HIGH"

    if crime >= 6 and night == true and isolated == true:
        return 90, "HIGH"

    if crime >= 2:
        return 55, "MEDIUM"

    # -----------------------------
    # ML-DRIVEN SCORE
    # -----------------------------
    score = int(high_prob * 100)

    # Environmental boost
    if crime >= 50 and score >= 50:
        score = max(score, 55)

    # -----------------------------
    # CONSISTENT SCORE → LEVEL
    # -----------------------------
    if score >= 75:
        return score, "HIGH"
    elif score >= 45:
        return score, "MEDIUM"
    else:
        return score, "LOW"
