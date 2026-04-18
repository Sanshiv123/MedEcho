# trials.py
# Calls the ClinicalTrials.gov API with a condition name
# and returns the top 3 matched active trials

import requests

CLINICALTRIALS_URL = "https://clinicaltrials.gov/api/v2/studies"

def get_matched_trials(condition: str) -> list:
    """
    Fetches top 3 active clinical trials matching the given condition
    from the ClinicalTrials.gov public API.

    Args:
        condition: medical condition string e.g. "Pneumonia"

    Returns:
        list of dicts with trial name, status, and location
    """

    try:
        response = requests.get(
            CLINICALTRIALS_URL,
            params={
                "query.cond": condition,
                "filter.overallStatus": "RECRUITING",
                "pageSize": 3,
                "format": "json"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        trials = []
        for study in data.get("studies", []):
            protocol = study.get("protocolSection", {})
            id_module = protocol.get("identificationModule", {})
            status_module = protocol.get("statusModule", {})
            contacts_module = protocol.get("contactsLocationsModule", {})

            # Extract first location if available
            locations = contacts_module.get("locations", [])
            location = locations[0].get("city", "Location not listed") if locations else "Location not listed"

            trials.append({
                "name": id_module.get("briefTitle", "Untitled Study"),
                "status": status_module.get("overallStatus", "Unknown"),
                "location": location
            })

        return trials

    except Exception as e:
        print(f"ClinicalTrials API error: {e}")
        return []