# backend/services/trials.py
# Matches patients to recruiting clinical trials from ClinicalTrials.gov.
#
# Uses the ClinicalTrials.gov v2 API to search for relevant studies and
# ranks them using a multi-factor scoring system:
#
# Scoring breakdown (max 100 points):
#   30% — Condition match (primary diagnosis in trial title/description)
#   15% — Differential diagnosis match (secondary conditions)
#   15% — Symptoms match (patient-reported symptoms in trial description)
#   20% — Location/country match (trial site near patient's city)
#   10% — Language match (trial in country matching patient's language)
#   10% — Trial phase (Phase 3 > Phase 2 > Phase 1)
#
# Searches for primary condition + top 2 differentials simultaneously
# to maximize relevant trial coverage, then deduplicates and returns top 3.

import requests

# ClinicalTrials.gov v2 API endpoint
CLINICALTRIALS_URL = "https://clinicaltrials.gov/api/v2/studies"

# ---------------------------------------------------------------------------
# Language-to-country mapping
# Used to boost trials located in countries where the patient's language
# is commonly spoken — improving accessibility and relevance.
# ---------------------------------------------------------------------------
LANGUAGE_COUNTRY_MAP = {
    "en": ["United States", "United Kingdom", "Canada", "Australia"],
    "es": ["Spain", "Mexico", "Argentina", "Colombia", "Chile"],
    "fr": ["France", "Belgium", "Switzerland", "Canada"],
    "hi": ["India"],
}


def get_country_from_city(city: str) -> str:
    """
    Resolves a city name to its country using the Nominatim geocoding API.

    Used to convert the patient's city (e.g. "New York") to a country
    (e.g. "United States") for filtering trials by country rather than
    city — city-level filtering is too strict and returns sparse results.

    Args:
        city: City name string (e.g. "Toronto", "Mumbai")

    Returns:
        Country name string, or empty string if resolution fails
    """
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": city, "format": "json", "limit": 1},
            headers={"User-Agent": "MedEcho/1.0"},
            timeout=5
        )
        data = response.json()
        if data:
            # Nominatim returns "City, Region, Country" — take the last part
            display = data[0].get("display_name", "")
            country = display.split(",")[-1].strip()
            return country
    except Exception:
        pass
    return ""


def calculate_match_score(
    trial: dict,
    condition: str,
    differential: list,
    symptoms: str,
    location: str,
    language: str,
    country: str
) -> int:
    """
    Calculates a 0–100 relevance score for a clinical trial against a patient's profile.

    Scoring factors:
    - Condition match (30%):     Primary diagnosis keywords in trial title/description
    - Differential match (15%):  Any differential condition keyword in trial title
    - Symptoms match (15%):      Patient symptoms keywords in trial title/description
    - Location match (20%):      Trial country matches patient's resolved country
    - Language match (10%):      Trial country is in patient's language's preferred countries
    - Trial phase (10%):         Phase 3 > Phase 2 > Phase 1 (closer to standard care)

    Args:
        trial:       Trial dict with name, description, location, country, phase
        condition:   Primary detected condition (e.g. "Pneumonia")
        differential: List of differential diagnosis strings
        symptoms:    Comma-separated patient symptoms string
        location:    Patient's city string
        language:    Patient's language code
        country:     Patient's resolved country from get_country_from_city

    Returns:
        Integer score between 0 and 100
    """
    score = 0
    title = trial.get("name", "").lower()
    description = trial.get("description", "").lower()
    trial_location = trial.get("location", "").lower()
    trial_country = trial.get("country", "").lower()
    phase = trial.get("phase", "")

    # --- Condition match (30%) ---
    # Split condition into keywords and check how many appear in title/description
    condition_keywords = condition.lower().split()
    condition_matches = sum(1 for kw in condition_keywords if kw in title or kw in description)
    score += min(30, (condition_matches / max(len(condition_keywords), 1)) * 30)

    # --- Differential diagnosis match (15%) ---
    # Award 5 points if any differential condition keyword appears in the trial title
    # Cap total at 45 to prevent differential from overriding condition score
    for diff in differential:
        diff_keywords = diff.lower().split()
        if any(kw in title for kw in diff_keywords):
            score += 5
            break
    score = min(score, 45)

    # --- Symptoms match (15%) ---
    # Check how many patient symptom keywords appear in the trial content
    # Only consider keywords longer than 3 chars to avoid noise words
    if symptoms:
        symptom_keywords = [s.strip().lower() for s in symptoms.replace(',', ' ').split()]
        symptom_matches = sum(
            1 for kw in symptom_keywords
            if len(kw) > 3 and (kw in title or kw in description)
        )
        score += min(15, symptom_matches * 5)

    # --- Location/country match (20%) ---
    # Full 20 points if trial country matches patient's country
    # Partial 10 points if patient's city appears in trial location
    if country and country.lower() in trial_country:
        score += 20
    elif location and location.lower() in trial_location:
        score += 10

    # --- Language match (10%) ---
    # Award points if trial is in a country where the patient's language is spoken
    preferred_countries = [c.lower() for c in LANGUAGE_COUNTRY_MAP.get(language, [])]
    if any(c in trial_country for c in preferred_countries):
        score += 10

    # --- Trial phase (10%) ---
    # Phase 3 trials are closest to standard care and most relevant for patients
    if "PHASE3" in phase or "Phase 3" in phase:
        score += 10
    elif "PHASE2" in phase or "Phase 2" in phase:
        score += 7
    elif "PHASE1" in phase or "Phase 1" in phase:
        score += 3

    return min(round(score), 100)


def get_matched_trials(
    condition: str,
    location: str = "",
    differential: list = [],
    symptoms: str = "",
    language: str = "en"
) -> list:
    """
    Fetches and scores recruiting clinical trials matching a patient's profile.

    Searches ClinicalTrials.gov for the primary condition plus the top 2
    differential diagnoses simultaneously, deduplicates results, scores each
    trial using calculate_match_score, and returns the top 3 by score.

    Geographic filtering uses the patient's resolved country (from Nominatim)
    rather than city, as city-level filtering is too restrictive and returns
    sparse or irrelevant results.

    Args:
        condition:    Primary detected condition (e.g. "Pneumonia")
        location:     Patient's city string for geographic filtering
        differential: List of differential diagnosis strings for broader search
        symptoms:     Comma-separated patient symptoms for relevance scoring
        language:     Patient's language code for language-country matching

    Returns:
        List of up to 3 trial dicts, sorted by match_score descending:
        [
            {
                "name":         "Trial title",
                "status":       "RECRUITING",
                "location":     "Boston",
                "country":      "United States",
                "phase":        "PHASE3",
                "nct_id":       "NCT12345678",
                "description":  "Brief summary...",
                "match_score":  72
            },
            ...
        ]
    """
    try:
        # Step 1: Resolve patient's city to country for geographic filtering
        country = get_country_from_city(location) if location else ""

        all_trials = []

        # Step 2: Search for primary condition + top 2 differentials
        # Searching multiple terms maximizes relevant trial coverage
        search_terms = [condition] + differential[:2]

        for term in search_terms:
            params = {
                "query.cond": term,
                "filter.overallStatus": "RECRUITING",
                "pageSize": 5,
                "format": "json"
            }

            # Apply geographic filter — country preferred over city
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

                # Extract location fields
                locations = contacts_module.get("locations", [])
                loc = locations[0].get("city", "Location not listed") if locations else "Location not listed"
                trial_country = locations[0].get("country", "") if locations else ""

                # Extract phase
                phases = design_module.get("phases", [])
                phase = phases[0] if phases else "N/A"

                nct_id = id_module.get("nctId", "")

                # Step 3: Deduplicate by NCT ID across all search terms
                if any(t["nct_id"] == nct_id for t in all_trials):
                    continue

                # Step 4: Build trial dict
                trial = {
                    "name": id_module.get("briefTitle", "Untitled Study"),
                    "status": status_module.get("overallStatus", "Unknown"),
                    "location": loc,
                    "country": trial_country,
                    "phase": phase,
                    "nct_id": nct_id,
                    "description": desc_module.get("briefSummary", ""),
                }

                # Step 5: Score the trial against the patient's profile
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

        # Step 6: Sort by match score and return top 3
        all_trials.sort(key=lambda x: x["match_score"], reverse=True)
        return all_trials[:3]

    except Exception as e:
        print(f"[Trials] ClinicalTrials API error: {e}")
        return []