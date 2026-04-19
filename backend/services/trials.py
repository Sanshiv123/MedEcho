import requests

CLINICALTRIALS_URL = "https://clinicaltrials.gov/api/v2/studies"

def get_country_from_city(city):
    # Simple approach — use nominatim geocoding
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

def get_matched_trials(condition: str, location: str = "") -> list:
    try:
        params = {
            "query.cond": condition,
            "filter.overallStatus": "RECRUITING",
            "pageSize": 10,
            "format": "json"
        }
        if location:
            country = get_country_from_city(location)
            if country:
                params["query.locn"] = country
            else:
                params["query.locn"] = location

        response = requests.get(CLINICALTRIALS_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        trials = []
        for study in data.get("studies", []):
            protocol = study.get("protocolSection", {})
            id_module = protocol.get("identificationModule", {})
            status_module = protocol.get("statusModule", {})
            contacts_module = protocol.get("contactsLocationsModule", {})
            design_module = protocol.get("designModule", {})

            locations = contacts_module.get("locations", [])
            loc = locations[0].get("city", "Location not listed") if locations else "Location not listed"

            phases = design_module.get("phases", [])
            phase = phases[0] if phases else "N/A"

            nct_id = id_module.get("nctId", "")
            
            trials.append({
                "name": id_module.get("briefTitle", "Untitled Study"),
                "status": status_module.get("overallStatus", "Unknown"),
                "location": loc,
                "phase": phase,
                "nct_id": nct_id
            })

            if len(trials) == 3:
                break

        return trials

    except Exception as e:
        print(f"ClinicalTrials API error: {e}")
        return []