import requests

CLINICALTRIALS_URL = "https://clinicaltrials.gov/api/v2/studies"

def get_matched_trials(condition: str, location: str = "") -> list:
    try:
        params = {
            "query.cond": condition,
            "filter.overallStatus": "RECRUITING",
            "pageSize": 3,
            "format": "json"
        }
        if location:
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

            locations = contacts_module.get("locations", [])
            loc = locations[0].get("city", "Location not listed") if locations else "Location not listed"

            trials.append({
                "name": id_module.get("briefTitle", "Untitled Study"),
                "status": status_module.get("overallStatus", "Unknown"),
                "location": loc
            })

        return trials

    except Exception as e:
        print(f"ClinicalTrials API error: {e}")
        return []