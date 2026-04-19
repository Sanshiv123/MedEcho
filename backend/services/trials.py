import requests

CLINICALTRIALS_URL = "https://clinicaltrials.gov/api/v2/studies"

LANGUAGE_COUNTRY_MAP = {
    "en": ["United States", "United Kingdom", "Canada", "Australia"],
    "es": ["Spain", "Mexico", "Argentina", "Colombia", "Chile"],
    "fr": ["France", "Belgium", "Switzerland", "Canada"],
    "hi": ["India"],
}

def get_country_from_city(city):
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": city, "format": "json", "limit": 1},
            headers={"User-Agent": "MedEcho/1.0"},
            timeout=5
        )
        data = response.json()
        if data:
            display = data[0].get("display_name", "")
            country = display.split(",")[-1].strip()
            return country
    except:
        pass
    return ""

def calculate_match_score(trial, condition, differential, symptoms, location, language, country):
    score = 0
    title = trial.get("name", "").lower()
    description = trial.get("description", "").lower()
    trial_location = trial.get("location", "").lower()
    trial_country = trial.get("country", "").lower()
    phase = trial.get("phase", "")

    # Condition match (30%)
    condition_keywords = condition.lower().split()
    condition_matches = sum(1 for kw in condition_keywords if kw in title or kw in description)
    score += min(30, (condition_matches / max(len(condition_keywords), 1)) * 30)

    # Differential diagnosis match (15%)
    for diff in differential:
        diff_keywords = diff.lower().split()
        if any(kw in title for kw in diff_keywords):
            score += 5
            break
    score = min(score, 45)

    # Symptoms match (15%)
    if symptoms:
        symptom_keywords = [s.strip().lower() for s in symptoms.replace(',', ' ').split()]
        symptom_matches = sum(1 for kw in symptom_keywords if len(kw) > 3 and (kw in title or kw in description))
        score += min(15, symptom_matches * 5)

    # Location/country match (20%)
    if country and country.lower() in trial_country:
        score += 20
    elif location and location.lower() in trial_location:
        score += 10

    # Language match (10%)
    preferred_countries = [c.lower() for c in LANGUAGE_COUNTRY_MAP.get(language, [])]
    if any(c in trial_country for c in preferred_countries):
        score += 10

    # Trial phase (10%)
    if "PHASE3" in phase or "Phase 3" in phase:
        score += 10
    elif "PHASE2" in phase or "Phase 2" in phase:
        score += 7
    elif "PHASE1" in phase or "Phase 1" in phase:
        score += 3

    return min(round(score), 100)

def get_matched_trials(condition: str, location: str = "", differential: list = [], symptoms: str = "", language: str = "en") -> list:
    try:
        country = get_country_from_city(location) if location else ""

        all_trials = []
        search_terms = [condition] + differential[:2]

        for term in search_terms:
            params = {
                "query.cond": term,
                "filter.overallStatus": "RECRUITING",
                "pageSize": 5,
                "format": "json"
            }
            if country:
                params["query.locn"] = country
            elif location:
                params["query.locn"] = location

            response = requests.get(CLINICALTRIALS_URL, params=params, timeout=10)
            if response.status_code != 200:
                continue
            data = response.json()

            for study in data.get("studies", []):
                protocol = study.get("protocolSection", {})
                id_module = protocol.get("identificationModule", {})
                status_module = protocol.get("statusModule", {})
                contacts_module = protocol.get("contactsLocationsModule", {})
                design_module = protocol.get("designModule", {})
                desc_module = protocol.get("descriptionModule", {})

                locations = contacts_module.get("locations", [])
                loc = locations[0].get("city", "Location not listed") if locations else "Location not listed"
                trial_country = locations[0].get("country", "") if locations else ""

                phases = design_module.get("phases", [])
                phase = phases[0] if phases else "N/A"
                nct_id = id_module.get("nctId", "")

                if any(t["nct_id"] == nct_id for t in all_trials):
                    continue

                trial = {
                    "name": id_module.get("briefTitle", "Untitled Study"),
                    "status": status_module.get("overallStatus", "Unknown"),
                    "location": loc,
                    "country": trial_country,
                    "phase": phase,
                    "nct_id": nct_id,
                    "description": desc_module.get("briefSummary", ""),
                }

                trial["match_score"] = calculate_match_score(
                    trial=trial,
                    condition=condition,
                    differential=differential,
                    symptoms=symptoms,
                    location=location,
                    language=language,
                    country=country
                )

                all_trials.append(trial)

        all_trials.sort(key=lambda x: x["match_score"], reverse=True)
        return all_trials[:3]

    except Exception as e:
        print(f"ClinicalTrials API error: {e}")
        return []